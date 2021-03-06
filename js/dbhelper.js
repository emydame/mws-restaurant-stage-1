/**
 * Common database helper functions.
 */
class DBHelper {
  
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */

  
  static get DATABASE_URL() {
    
       
      const port = 1337 // Change this to your server port
    return `https://emydame.github.io/Restaurant_Reviews/data/restaurants.json`;
   //return `http://localhost:${port}/restaurants`;

  
  }

  static get DATABASE_REVIEWS_URL() {
    
       
    const port = 1337 // Change this to your server port
  return `http://localhost:${port}/reviews/`;


}
  /**
   * 
Create Index db
   */
  static getIndexDB= (restaurants) =>{
    const dbPromise =idb.open('restaurant-store', 1, upgradeDB => {
      upgradeDB.createObjectStore('restaurants',{
        keyPath:'id'
      });
      
    });
    return dbPromise;
  }

  
   /**
   * Fetch all restaurants from indexdb
   */
static getRestaurantsFromIdb(dbPromise){
  return DBHelper.getIndexDB().then(dbPromise =>{
    if(!dbPromise)return;
    let db= dbPromise.transaction('restaurants')
        .objectStore('restaurants');
      return db.getAll();
      })
 
}


  /**
   * Fetch all restaurants from server
   */
  static fetchRestaurantsFromServer() {
   
   return fetch(DBHelper.DATABASE_URL).then(restaurants => {return restaurants.json()})
    .then(restaurants => {console.log('Success:', (restaurants => restaurants.json()))
    DBHelper.getIndexDB().then(dbPromise =>{  
    if(!dbPromise)return;
    restaurants.forEach(element => {
    let tx = dbPromise.transaction('restaurants', 'readwrite');

    console.log(element);
      tx.objectStore('restaurants').put(element);
      return tx.complete;
    })})
   return restaurants;
    })
    .catch(error => console.error('error:', error))
}

  static fetchRestaurants(callback) {
   
      return DBHelper.getRestaurantsFromIdb().then(
        restaurants => {if(!(restaurants.length))
      {
        return DBHelper.fetchRestaurantsFromServer();
      }
      return Promise.resolve(restaurants);
      }).then(restaurants => {
        callback(null,restaurants);
      }).catch(error =>{
        callback(error, null);
      });
      
  }
  

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

   /**
   * Fetch all restaurant reviews
   */
// http://localhost:1337/reviews/?restaurant_id=<restaurant_id>

static fetchallReviewsFromServer(callback) {
  let url=DBHelper.DATABASE_REVIEWS_URL;   //+`?restaurant_id=${id}`;
    return fetch(url).then(response => {
      let rev= response.json();
      rev.then(function(responseValue) {
        callback(null,responseValue);
      });     
     
    }) .catch(error =>{
      callback(error, null);
    });
 }


 
/**
   * Fetch a restaurant review by its ID.
   */
  static oldfetchRestaurantReviewsById(id, callback) {
    // fetch  restaurants reviews by id with proper error handling.
      
   let rev= DBHelper.fetchReviewsFromServer((error,response) =>  {
      if (error) {
        console.log('Unable to retrieve reviews');
      }else{        
        let reviewsi = response.filter(r => r.restaurant_id === id);
        console.log(reviewsi);
        if (reviewsi) { // Got the review
          callback(null,reviewsi);
        } else { // Restaurant review does not exist in the database
          callback('Review does not exist', null);
        }
      }
    });
  }

  static fetchReviewsFromServerbyid(id,callback) {
    let url=DBHelper.DATABASE_REVIEWS_URL+'?restaurant_id='+id;   //`?restaurant_id=${id}`;
      return fetch(url).then(response => {
        let rev= response.json();
        rev.then(function(responseValue) {
          callback(null,responseValue);
        });     
       
      }) .catch(error =>{
        callback(error, null);
      });
   }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/images/img/${restaurant.photograph || restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      
      }
      
    )
      
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

/**
 * 
 * Mark Restaurant as favorite
 */
/**
 * get favorite restaurants
 */
static getFavRestaurants(callback){
  const url="http://localhost:1337/restaurants/?is_favorite=true"
  fetch(url).then(response => {
    let isFav=response.json();
    isFav.then(function(responseValue) {
      callback(null,responseValue);
    });     
   
  }).catch(error =>{
    callback(error,null);
  })
}

static checkifRestaurantisFav(id,callback) {
  // Fetch all restaurants that are favorites
  DBHelper.getFavRestaurants((error, restaurants) => {
    if (error) {
      callback(error, null);
    } else {
      // filter result by restaurant-id
      const favRestaurants =  restaurants.filter(r => r.id == id);
      callback(null, favRestaurants);
    }
  });
}



static sendFavoritetoserver=(id,state)=>{
  const url = 'http://localhost:1337/restaurants/'+2+'/?is_favorite='+state;
  fetch(url, {
    method: 'PUT'   
  });
}
}

