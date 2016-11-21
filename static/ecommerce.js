var app = angular.module('e-commerce', ['ui.router', 'ngCookies']);

app.factory("Commerce_api", function factoryFunction($http, $cookies){
  var service = {};
  service.displayProducts = function(){
    return $http({
      url: '/api/products'
    });
  };

  service.displayIndProduct = function(product_id) {
    return $http({
      url: '/api/products/' + product_id
    });
  };

  service.userSignup = function(username, email, password, first_name, last_name) {
    return $http ({
      url: '/api/user/signup',
      method: "POST",
      data: {
        username: username,
        email: email,
        password: password,
        first_name: first_name,
        last_name: last_name
      }
    });
  };

  service.userLogin = function(username, password) {
    return $http ({
      url: '/api/user/login',
      method: "POST",
      data: {
        username: username,
        password: password
      }
    });
  };

  service.addToCart = function(product_id, auth_token) {
    return $http ({
      url: '/api/shopping_cart',
      method: "POST",
      data: {
        product_id: product_id,
        auth_token: auth_token
      }
    });
  };

    service.displayCart = function(auth_token){
      return $http({
        url: '/api/shopping_cart',
        params: {
          auth_token : auth_token
        }
      });
    };

  service.checkOut = function(address, auth_token) {
    return $http({
      url: '/api/shopping_cart/checkout',
      method: 'POST',
      data: {
        address: address,
        auth_token: auth_token
      }
    });
  };

  return service;
});

app.run(function($rootScope, $cookies, $state) {
  $rootScope.logOut = function() {
    $cookies.remove('username');
    $cookies.remove('customer_id');
    $cookies.remove('token');
    $rootScope.logState = false;
    console.log($rootScope.logState);
    $state.go('login');
  };
});

app.controller('HomeController', function($scope, Commerce_api, $cookies, $rootScope){
    Commerce_api.displayProducts().success(function(results){
      $scope.results = results;
      console.log("Here", $scope.results);
      $rootScope.username_root = $cookies.get('username');
    });

});


app.controller('IndProductController', function($scope, $stateParams, Commerce_api, $rootScope, $cookies){
  $scope.product_id = $stateParams.product_id;
    Commerce_api.displayIndProduct($scope.product_id).success(function(result){
      $scope.result = result[0];
      console.log("Here", $scope.result);
      $rootScope.username_root = $cookies.get('username');

    });

    $scope.addToCart = function(product_id){
      var auth_token = $cookies.get('token');
      Commerce_api.addToCart(product_id, auth_token).success(function(){
        console.log("Items added to cart");
      });

    };
});

app.controller('SignupController', function($scope, $state, Commerce_api){
   $scope.signUpUser = function() {
    if($scope.password2 === $scope.password1){
    Commerce_api.userSignup($scope.username, $scope.email, $scope.password1, $scope.first_name, $scope.last_name).success(function() {
      console.log('Stuff');
    });
    $state.go('login');
    }
    else {
      $scope.pwmatch = true;
      console.log('Something');
    }
  };
});

app.controller('LoginController', function($scope, Commerce_api, $state, $cookies, $rootScope){
   $scope.loginUser = function() {
    Commerce_api.userLogin($scope.username, $scope.password).success(function(response) {
      $scope.token = response.auth_token.token;
      console.log(response);
      $scope.customer_id = response.user.id;
      $scope.username = response.user.username;
      $cookies.put('token', $scope.token);
      $cookies.put('customer_id', $scope.customer_id);
      $cookies.put('username', $scope.username);
      console.log($scope.token);
      $rootScope.username_root = $cookies.get('username');
      console.log($scope.username);
      $rootScope.logState = true;
    });
    $state.go('home');
  };
});

app.controller('ShoppingCartController', function($scope, Commerce_api, $cookies, $rootScope){
    $scope.auth_token = $cookies.get('token');
    Commerce_api.displayCart($scope.auth_token).success(function(results){
      $scope.results = results;
      $scope.sum_of_sale = 0;
      for (var i = 0; i < results.length; i++) {
        $scope.sum_of_sale += results[i].prodprice;
      }
      $cookies.put('sum', $sum_of_sale);
      console.log($scope.sum_of_sale);
      console.log("Here", $scope.results);
      $rootScope.username_root = $cookies.get('username');
    });
});

app.controller('CheckoutController', function($scope, $cookies, Commerce_api) {
  $scope.checkout = function () {
    if (!$scope.address2) {
      $scope.address2 = "";
    }
    $scope.addressString = ($scope.address + $scope.address2 + $scope.city + $scope.state_of_US + ($scope.zip_code).toString());
    console.log($scope.addressString);
    $scope.auth_token = $cookies.get('token');
    console.log($scope.auth_token)
    Commerce_api.checkOut($scope.address, $scope.auth_token).success(function() {

    });
  };
});

app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state({
      name : 'home',
      url : '/home',
      templateUrl: 'home.html',
      controller: 'HomeController'
    })
    .state({
      name : 'individual_product',
      url : '/product/{product_id}',
      templateUrl: 'individual_product.html',
      controller: 'IndProductController'
    })
    .state({
      name : 'signup',
      url : '/user/signup',
      templateUrl: 'user_signup.html',
      controller: 'SignupController'
    })
    .state({
      name : 'login',
      url : '/user/login',
      templateUrl: 'login.html',
      controller: 'LoginController'
    })
    .state({
      name : 'shopping_cart',
      url : '/shopping_cart',
      templateUrl: 'shopping_cart.html',
      controller: 'ShoppingCartController'
    })
    .state({
      name: 'checkout',
      url: '/checkout',
      templateUrl: 'checkout.html',
      controller: 'CheckoutController'
    })
    ;
});
