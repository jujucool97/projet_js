<template>
  <div class="image">
    <div>
      <h1>JUJU ADVISOR</h1>
      <h2>Nombre de restaurants : {{ nbRestaurantsTotal }}</h2>
      <p>Nb de pages total : {{ nbPagesTotal }}</p>
      <p>
        Nb restaurants par page :
        <input
          @input="getRestaurantsFromServer()"
          type="range"
          min="2"
          max="1000"
          v-model="pagesize"
        />{{ pagesize }}
      </p>
      <md-button
        class="md-raised md-primary"
        :disabled="page === 1"
        @click="premierePage()"
        >Premiere Page</md-button
      >
      <md-button
        class="md-raised md-primary"
        :disabled="page === 1"
        @click="pagePrecedente()"
        >Précédent</md-button
      >
      <md-button
        class="md-raised md-primary"
        :disabled="page === nbPagesTotal - 1"
        @click="pageSuivante()"
      >
        Suivant
      </md-button>
      <md-button
        class="md-raised md-primary"
        :disabled="page == nbPagesTotal - 1"
        @click="DernierePage()"
        >Derniere Page</md-button
      >
      Page courante : {{ page }}
      <br />
    </div>

    <md-app>
      <md-app-toolbar class="md-primary" md-elevation="0">
        <md-button
          class="md-icon-button"
          @click="toggleMenu"
          v-if="!menuVisible"
        >
          <md-icon>menu</md-icon>
        </md-button>
        <span class="md-title">Menu</span>

        <span v-if="value">Value: {{ value }}</span>
      </md-app-toolbar>
      <md-app-drawer :md-active.sync="menuVisible" md-persistent="mini">
        <md-toolbar class="md-transparent" md-elevation="0">
          <span>Navigation</span>

          <div class="md-toolbar-section-end">
            <md-button class="md-icon-button md-dense" @click="toggleMenu">
              <md-icon>keyboard_arrow_left</md-icon>
            </md-button>
          </div>
        </md-toolbar>

        <md-list>
          <md-list-item @click="showDialog2 = true">
            <md-icon>add</md-icon>
            <span class="md-list-item-text">Ajouter un restaurant</span>
            <md-dialog :md-active.sync="showDialog2">
              <md-dialog-title>Ajouter un restaurant</md-dialog-title>
              <md-tabs md-dynamic-height>
                <md-tab md-label="Ajout">
                  <form @submit.prevent="ajouterRestaurant($event)">
                    <label>
                      Nom :
                      <input name="nom" type="text" required v-model="nom" />
                    </label>
                    <label>
                      Cuisine :
                      <input
                        name="cuisine"
                        type="text"
                        required
                        v-model="cuisine"
                      />
                    </label>

                    <button>Ajouter</button>
                  </form>
                </md-tab>
              </md-tabs>

              <md-dialog-actions>
                <md-button class="md-primary" @click="showDialog2 = false"
                  >Fermer</md-button
                >
              </md-dialog-actions>
            </md-dialog>
          </md-list-item>

          <md-list-item @click="sup">
            <md-icon>delete</md-icon>
            <span class="md-list-item-text">Supprimer</span>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <md-table
          v-model="restaurants"
          md-sort="name"
          md-sort-order="asc"
          md-card
          md-fixed-header
          @md-selected="onSelect"
        >
          <md-table-toolbar>
            <div class="md-toolbar-section-start">
              <h2>Liste des restaurants</h2>
            </div>

            <md-field md-clearable class="md-toolbar-section-end">
              <md-input
                placeholder="Recherche par nom..."
                v-model="nomRestauRecherche"
                @input="chercherRestaurants()"
              />
            </md-field>
          </md-table-toolbar>

          <md-table-empty-state
            md-label="Pas de restaurants trouvés"
            :md-description="` Pas de restaurants trouvés pour '${nomRestauRecherche}'. Essayez autre chose.`"
          >
          </md-table-empty-state>

          <md-table-row
            slot="md-table-row"
            slot-scope="{ item, index }"
            :style="{ backgroundColor: getColor(index, item) }"
            :class="{ bordureRouge: index === 2 }"
            md-selectable="multiple"
            md-auto-select
          >
            <md-table-cell md-label="Nom" md-sort-by="name">{{
              item.name
            }}</md-table-cell>
            <md-table-cell md-label="Cuisine" md-sort-by="cuisine">{{
              item.cuisine
            }}</md-table-cell>
            <md-table-cell md-label="Quartier" md-sort-by="borough">{{
              item.borough
            }}</md-table-cell>
            <md-table-cell md-label="Actions">
              <router-link :to="'/restaurant/' + item._id"
                ><md-button class="md-raised md-primary">Details</md-button>
              </router-link>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
import _ from "lodash";
import { gmapApi } from "vue2-google-maps";

export default {
  name: "ListeRestaurants",
  props: {},
  data() {
    return {
      showDialog2: false,
      active: false,
      value: null,
      selected: [],
      courantSelected: {
        address: { building: "", coord: [], street: "", borough: "" },
      },
      menuVisible: false,
      restaurants: [{}],
      nom: "",
      lat: 0,
      long: 0,
      cuisine: "",
      nbRestaurantsTotal: 0,
      page: 1,
      pagesize: 10,
      nbPagesTotal: 0,
      msg: "",
      nomRestauRecherche: "",
      markers: [],
      initial: null,
      type: null,
      withLabel: null,
      inline: null,
      number: null,
      textarea: null,
      autogrow: null,
      disabled: null,
      selection: {
        name: "",
        address: { building: "", coord: [], street: "", borough: "" },
      },
    };
  },

  mounted: function () {
    this.getRestaurantsFromServer();
  },

  computed: {
    google: gmapApi,
  },

  methods: {
    sup() {
      this.selected.forEach((element) => {
        this.supprimerRestaurant(element);
      });
    },

    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },

    onSelect(items) {
      console.log(items);
      this.selected = items;
      this.courantSelected = items[items.length - 1];
      this.long = this.courantSelected.address.coord[0];
      this.lat = this.courantSelected.address.coord[1];
      this.street = this.courantSelected.address.street;
      this.name = this.courantSelected.name;
    },
    getAlternateLabel(count) {
      let plural = "";

      if (count > 1) {
        plural = "s";
      }

      return `${count} user${plural} selected`;
    },

    premierePage() {
      this.page = 1;
      this.getRestaurantsFromServer();
    },

    DernierePage() {
      this.page = this.nbPagesTotal - 1;
      this.getRestaurantsFromServer();
    },

    pagePrecedente() {
      if (this.page === 1) return;

      this.page--;
      this.getRestaurantsFromServer();
    },
    pageSuivante() {
      if (this.page === this.dernierePage) return;
      this.page++;
      this.getRestaurantsFromServer();
    },
    getRestaurantsFromServer() {
      let url = "http://localhost:8080/api/restaurants?";
      url += "page=" + this.page;
      url += "&pagesize=" + this.pagesize;
      url += "&name=" + this.nomRestauRecherche;

      fetch(url)
        .then((responseJSON) => {
          // arrow functions, conserve le bon "this"
          // la réponse est en JSON, on la convertit avec la ligne suivante
          responseJSON.json().then((resJS) => {
            // Maintenant resJS est un vrai objet JavaScript
            this.restaurants = resJS.data;
            this.nbRestaurantsTotal = resJS.count;
            this.nbPagesTotal = Math.round(
              this.nbRestaurantsTotal / this.pagesize
            );
          });
        })
        .catch(function (err) {
          console.log(err);
        });
    },
    chercherRestaurants: _.debounce(function () {
      // appelée que si on n'a pas tapé de touches pendant un certain délai
      this.getRestaurantsFromServer();
    }, 300),
    supprimerRestaurant(r) {
      let url = "http://localhost:8080/api/restaurants/" + r._id;

      fetch(url, {
        method: "DELETE",
      })
        .then((responseJSON) => {
          responseJSON.json().then((resJS) => {
            // Maintenant res est un vrai objet JavaScript
            console.log(resJS.msg);
            this.msg = resJS.msg;
            // On rafraichit la vue
            this.getRestaurantsFromServer();
          });
        })
        .catch(function (err) {
          console.log(err);
        });
    },
    ajouterRestaurant(event) {
      // Récupération du formulaire. Pas besoin de document.querySelector
      // ou document.getElementById puisque c'est le formulaire qui a généré
      // l'événement
      let form = event.target;

      // Récupération des valeurs des champs du formulaire
      // en prévision d'un envoi multipart en ajax/fetch
      let donneesFormulaire = new FormData(form);

      let url = "http://localhost:8080/api/restaurants";

      fetch(url, {
        method: "POST",
        body: donneesFormulaire,
      })
        .then((responseJSON) => {
          responseJSON.json().then((resJS) => {
            // Maintenant res est un vrai objet JavaScript
            console.log(resJS.msg);
            this.msg = resJS.msg;
            // On rafraichit la vue
            this.getRestaurantsFromServer();
          });
        })
        .catch(function (err) {
          console.log(err);
        });

      this.nom = "";
      this.cuisine = "";
    },
    getColor(index) {
      return index % 2 ? "lightBlue" : "pink";
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input:invalid {
  background-color: pink;
}

h1 {
  color: #ffffff;
}

.bordureRouge {
  border: 2px dashed red;
}

.image {
  background-image: url("https://provence-alpes-cotedazur.com/app/uploads/2019/03/Nice-PACA-credit-Fotolia-e1553851803445.jpg");
}
</style>
