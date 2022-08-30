<template>
  <div style="height: 100vh; width: 100%">
    <audio :src="audioSuccess" id="audioSuccess" />
    <audio :src="audioFail" id="audioFail" />
    <div class="columns float">
      <div class="column is-flex is-justify-content-center">
        <div class="points success" v-text="ok" />
        <div class="points fail" v-text="fail" />
        <div class="total-prov" v-text="totalProvincias" />
      </div>
    </div>
    <l-map v-if="showMap" :zoom="zoom" :center="center" :options="mapOptions" style="height: 100%"
      @update:center="centerUpdate" @update:zoom="zoomUpdate" :key="forceRender">
      <l-tile-layer :url="url" />
      <l-geo-json :geojson="item" :options-style="comunidadesStyles(item)" v-for="(item, index) in comunidades"
        :key="`comunidad-${index}`" />
      <l-geo-json :geojson="provincias" :options-style="provinciasStyles" />
      <l-marker :lat-lng="icon.coordinates" v-for="(icon, index) in where" :key="`item-${index}`"
        @click="markerClick(icon)">
        <l-icon :icon-size="[icon.size, icon.size]" :icon-anchor="[icon.size / 2, icon.size]"
          :icon-url="icons[index].icon" :data-id="`icon-id-${icon.id}`" :data-status="false" />
        <l-tooltip v-if="icons[index].tooltip">{{  icons[index].description  }}</l-tooltip>
      </l-marker>
    </l-map>
    <div :class="['modal', { 'is-active': showModal || showPrize }]">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">ENHORABUENA!!!!</p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>
        <section class="modal-card-body">
          Has acertado las {{  where.length  }} provincias de España y has tenido {{  fail  }} fallo{{  fail !== 1 ? 's' : ''
          }}.
        </section>
        <footer class="modal-card-foot"></footer>
      </div>
    </div>
  </div>
</template>

<script>
import question from './assets/question.png'
import check from './assets/check.png'
import audioSuccess from './assets/success.ogg'
import audioFail from './assets/fail.mp3'
import { latLng } from 'leaflet'
import { LMap, LTileLayer, LGeoJson, LMarker, LIcon, LTooltip } from 'vue2-leaflet'
import { PROVINCIAS } from './assets/provincias.js'
import {
  ANDALUCIA,
  ARAGON,
  CANARIAS,
  CANTABRIA,
  CASTILLA_LA_MANCHA,
  CASTILLA_LEON,
  CATALUNIA,
  NAVARRA,
  VALENCIA,
  MADRID,
  EXTREMADURA,
  GALICIA,
  BALEARES,
  RIOJA,
  PAIS_VASCO,
  ASTURIAS,
  MURCIA
} from './assets/comunidades.js'
import { WHERE } from './assets/where.js'

export default {
  name: 'maps-app',
  components: {
    LMap,
    LTileLayer,
    LGeoJson,
    LMarker,
    LIcon,
    LTooltip
  },
  data() {
    return {
      backIcons: [],
      forceRender: 0,
      ok: 0,
      fail: 0,
      audioSuccess,
      audioFail,
      icons: [],
      question,
      check,
      infoModal: {},
      showMap: false,
      showModal: false,
      zoom: 7,
      center: latLng(40.41700043671683, -3.7035601180060613),
      currentZoom: 7,
      currentCenter: latLng(40.41700043671683, -3.7035601180060613),
      mapOptions: {
        zoomSnap: 0.5,
        maxZoom: 9,
        minZoom: 6
      },
      url: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png',
      selectedMap: 'watercolor',
      provincias: null,
      where: null,
      ccaa: {
        '01': 'Andalucía',
        '02': 'Aragón',
        '03': 'Balears, Illes',
        '04': 'Canarias',
        '05': 'Cantabria',
        '06': 'Castilla-La Mancha',
        '07': 'Castilla y León',
        '08': 'Cataluña',
        '09': 'Ceuta',
        10: 'Extremadura',
        11: 'Galicia',
        12: 'Rioja, La',
        13: 'Madrid, Comunidad de',
        14: 'Melilla',
        15: 'Murcia, Región de',
        16: 'Navarra, Comunidad Foral de',
        17: 'País Vasco',
        18: 'Asturias, Principado de',
        19: 'Comunitat Valenciana'
      }
    }
  },
  computed: {
    totalProvincias() {
      return `Total provincias acertadas: ${this.ok} de ${this.where.length}`
    },
    provinciasStyles() {
      return () => ({
        weight: 1,
        color: '#000000',
        opacity: 0.1,
        fillOpacity: 0
      })
    },
    showPrize() {
      return this.ok === this.where.length
    }
  },
  methods: {
    closeModal() {
      this.setupData()
      this.initGame()
      this.showModal = false
      this.forceRender = new Date().getTime()
    },
    comunidadesStyles(item) {
      const comunidadesColors = {
        ANDALUCIA: '#92f793',
        ARAGON: '#a25ef4',
        CANARIAS: '#d2e266',
        CANTABRIA: '#f863dc',
        CASTILLA_LA_MANCHA: '#3ecdd0',
        CASTILLA_LEON: '#ffaa00',
        CATALUNIA: '#ff00ff',
        NAVARRA: '#aad8c9',
        VALENCIA: '#0098ef',
        MADRID: '#88ccaa',
        EXTREMADURA: '#55aa88',
        GALICIA: '#aa00ff',
        BALEARES: '#ee9933',
        RIOJA: '#aa4444',
        PAIS_VASCO: '#ff00aa',
        ASTURIAS: '#1155ff',
        MURCIA: '#ff0000'
      }
      return () => ({
        weight: 2,
        color: '#000000',
        opacity: 1,
        fillColor: comunidadesColors[item.who],
        fillOpacity: 1
      })
    },
    markerClick(data) {
      const el = document.querySelector(`[data-id*='${data.id}']`)
      if (!JSON.parse(el.dataset?.status || 'false')) {
        const response = prompt('¿Que provincia es?') || ''
        if (response.toUpperCase() === data.prov) {
          document.querySelector('#audioSuccess').play()
          el.dataset.status = true
          this.icons[data.id - 1] = { icon: this.check, tooltip: true, description: `${data.prov} / ${data.com}` }
          this.icons = [...this.icons]
          this.ok++
        } else {
          if (response.length > 0) {
            document.querySelector('#audioFail').play()
            this.fail++
          }
        }
      }
    },
    changeMap(type) {
      this.selectedMap = type
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom
    },
    centerUpdate(center) {
      this.currentCenter = center
    },
    setupData() {
      debugger
      this.where = [...WHERE]
      this.icons = this.where.map(item => ({ icon: question, tooltip: false, description: '' }))
    },
    initGame() {
      debugger
      this.provincias = PROVINCIAS
      this.comunidades = [
        ANDALUCIA,
        ARAGON,
        CANARIAS,
        CANTABRIA,
        CASTILLA_LA_MANCHA,
        CASTILLA_LEON,
        CATALUNIA,
        NAVARRA,
        VALENCIA,
        MADRID,
        EXTREMADURA,
        GALICIA,
        BALEARES,
        RIOJA,
        PAIS_VASCO,
        ASTURIAS,
        MURCIA
      ]
      this.fail = 0
      this.ok = 0
      document.querySelectorAll('[data-status]').forEach(item => {
        item.dataset.status = false
      })
      this.showMap = true
    }
  },
  created() {
    this.setupData()
  },
  mounted() {
    this.initGame()
  }
}
</script>

<style lang="scss">
@import 'https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css';

body {
  margin: 0;
  padding: 0;
}

.columns {
  margin: 0 !important;
  padding: 0;
}

.float {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(200, 200, 200, .6);
  box-shadow: 0 5px 8px 3px rgb(0 0 0 / 20%);
}

button {
  box-shadow: 0 0 4px 2px rgb(0 0 0 / 20%);
}

.tooltip {
  .title {
    font-size: 22px;
    color: #000000;
  }

  .subtitle {
    font-size: 14px;
    color: #000000;
  }
}

.modal {
  z-index: 10000;

  img {
    width: 100%;
    height: auto;
  }
}

.icon-question {
  box-shadow: 0 0 6px 3px rgb(0 0 0 / 30%);
  border-radius: 50px;
  width: 50px;
  height: 50px;
  padding: 9px;
}

.points {
  width: 100px;
  text-align: center;
  padding: 1px;
  margin: 4px;
  color: #ffffff;
  border-radius: 5px;
  user-select: none;
}

.success {
  background: rgba(0, 200, 0, .4);
}

.fail {
  background: rgba(200, 0, 0, .4);
}

.total-prov {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 300px;
  height: 34px;
}
</style>
