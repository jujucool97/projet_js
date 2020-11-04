<template>
  <div class="page-container">
    <md-app md-waterfall md-mode="fixed-last">
      <md-app-toolbar class="md-large md-dense md-primary">
        <div class="md-toolbar-row">
          <div class="md-toolbar-section-start">
            <span class="md-title">Restaurant</span>
          </div>
          <div class="md-toolbar-section-end">
            <router-link to="/">
              <md-button class="md-icon-button">
                <md-icon>home</md-icon>
              </md-button></router-link
            >
          </div>
        </div>
      </md-app-toolbar>

      <md-app-content>
        <md-field>
          <label>Nom du restaurant</label>
          <md-input v-model="restaurant.name" readonly></md-input>
        </md-field>

        <md-field>
          <label>Cuisine</label>
          <md-input v-model="restaurant.cuisine" readonly></md-input>
        </md-field>

        <md-field>
          <label>N°</label>
          <md-input v-model="restaurant.address.building" readonly></md-input>
        </md-field>

        <md-field>
          <label>Adresse</label>
          <md-input v-model="restaurant.address.street" readonly></md-input>
        </md-field>

        <md-field>
          <label>Quartier</label>
          <md-input v-model="restaurant.borough" readonly></md-input>
        </md-field>

        <md-field>
          <label>Zip code</label>
          <md-input v-model="restaurant.address.zipcode" readonly></md-input>
        </md-field>
        <GmapMap
          :center="{
            lat: restaurant.address.coord[1],
            lng: restaurant.address.coord[0],
          }"
          :zoom="17"
          map-type-id="terrain"
          style="width: 500px; height: 300px"
        >
          <GmapMarker
            :key="index"
            v-for="(m, index) in markers"
            :position="m.position"
            :clickable="true"
            :draggable="true"
            @click="center = m.position"
          />
        </GmapMap>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
export default {
  name: "Restaurant",
  menuVisible: false,
  initial: "Initial Value",
  type: null,
  withLabel: null,
  inline: null,
  number: null,
  textarea: null,
  autogrow: null,
  disabled: null,
  props: {},
  computed: {
    id() {
      return this.$route.params.id;
    },
  },
  data: function () {
    return {
      restaurant: null,
    };
  },
  mounted() {
    console.log("id" + this.id);
    let url = "http://localhost:8080/api/restaurants/" + this.id;
    fetch(url)
      .then((reponse) => {
        return reponse.json();
      })
      .then((data) => {
        this.restaurant = data.restaurant;
      });
  },
  methods: {},
};
</script>

<style scoped>
</style>