
angular.module('formApp', ['ngAnimate', 'ui.router'])

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('form', {
            url: '/form',
            templateUrl: 'form.html',
            controller: 'formController'
        })
        .state('form.profile', {
            url: '/profile',
            templateUrl: 'form-profile.html'
        })
        .state('form.interests', {
            url: '/interests',
            templateUrl: 'form-interests.html'
        })
        .state('form.payment', {
            url: '/payment',
            templateUrl: 'form-payment.html'
        });

    
    $urlRouterProvider.otherwise('/form/profile');
})
.controller('formController', function($scope, $http) {
    $scope.formData = {};
//     $http.get('http://localhost:9000/api/findaAll')
//         .then((result)=>{
//         console.log('result', result.data);
//          $scope.allemployee = result.data;
//         }).catch((err)=>{
//         console.log('err', err);
//         })
//    var data = { 
// 	"name":"pnsss",
// 	"email":"qjqjq@gmail.com",
// 	"password":"error@123"
// };
    $scope.processForm = function() {
        alert('awesome!');
        // $http.post('http://localhost:9000/api/customerRegistration', data)
        // .then((result)=>{
        // console.log('result', result);
        // }).catch((err)=>{
        // console.log('err', err);
        // })
    };

});