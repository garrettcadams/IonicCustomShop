/* global Firebase */
angular.module('app.controllers', [])
    .constant('DBREF', 'https://customshop.firebaseio.com/')

    .controller('AuthController', function ($rootScope, $scope, $firebaseObject, $firebaseArray, DBREF, $state) {
        var db = new Firebase(DBREF);

        // Handles DB responses/ Sets DB paths
        function handleDBResponse(err, authData) {
            if (err) {
                console.log(err);
                return;
            }
            // console.log("Login Auth, did we get here?")
            // console.log(authData)

            $rootScope.member = $firebaseObject(new Firebase(DBREF + 'users/' + authData.uid));
            $rootScope.myDesigns = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myDesigns'));
            $rootScope.myOrders = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myOrders'));
            $rootScope.myImages = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myImages'));
            $rootScope.myCart = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myCart'));

            $rootScope.member.$loaded(function () {
                $state.go('tabsController.t-ShirtDesigner');
            })
        }
        var authData = db.getAuth();
        if (authData) {
            handleDBResponse(null, authData);
        }

        //Logs the user out
        $scope.logout = function (user) {
            alert('Logout Button Clicked')
            $state.go('login')
            db.unauth();
        }


    })

    .controller('loginCtrl', function ($rootScope, $scope, $firebaseObject, $firebaseArray, DBREF, $state) {
        var db = new Firebase(DBREF);
        $scope.user = {}

        function handleDBResponse(err, authData) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Login Auth, did we get here?")
            console.log(authData)
            // Sets up DB references
            $rootScope.member = $firebaseObject(new Firebase(DBREF + 'users/' + authData.uid));
            $rootScope.myDesigns = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myDesigns'));
            $rootScope.myOrders = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myOrders'));
            $rootScope.myImages = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myImages'));
            $rootScope.myCart = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myCart'));

            $rootScope.member.$loaded(function () {
                $state.go('tabsController.t-ShirtDesigner');
            })
        }
        $scope.login = function (user) {
            user ? db.authWithPassword(user, handleDBResponse) : ''
            // console.log(user.email + user.password)
        }
    })
    // AuthService,
    .controller('signupCtrl', function ($scope, DBREF, $firebaseArray, $state, $rootScope, $firebaseObject) {
        var db = new Firebase(DBREF);
        $scope.user = {}
        // var db = AuthService.db();
        $rootScope.member = {};
        $scope.errorMessage = '';
        // $scope.user = AuthService.getUser();
        $scope.signup = function (user) {
            db.createUser(user, handleDBResponse)
            function handleDBResponse(err, authData) {
                if (err) {
                    console.log(err);
                    // console.log($scope.errorMessage);
                    return;
                }
                // console.log("Signup createUser, did we get here?")
                // console.log(authData);
                $state.go('tabsController.t-ShirtDesigner')
                //Creates User
                var userToSave = {
                    username: $scope.user.email,
                    reputation: 0,
                    created: Date.now(),
                    uploads: [],
                    current: {}
                }

                //This sets up DB references
                db.child('users').child(authData.uid).update(userToSave);
                $rootScope.member = $firebaseObject(new Firebase(DBREF + 'users/' + authData.uid));
                $rootScope.myDesigns = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myDesigns'));
                $rootScope.myOrders = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myOrders'));
                $rootScope.myImages = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myImages'));
                $rootScope.myCart = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/myCart'));
                // $rootScope.currentDesign = $firebaseArray(new Firebase(DBREF + 'users/' + authData.uid + '/currentDesign'));

            }
        }
    })

    .controller('t-ShirtDesignerCtrl', function ($scope, $state, ShirtService, OrderService, CreateService, $ionicScrollDelegate, DBREF, RefService, PayService, $firebaseArray, $rootScope) {
        //Testing PayService
        // var promise = PayService.paymentApi();
        // promise.then(function (data) {
        //     console.log("promise data:", promise, data)
        // })

        var ref = new Firebase(DBREF);
        var activeRef = ref.child('Active Orders');
        $scope.activeOrders = new $firebaseArray(activeRef);
        // $scope.printedShirts = ShirtService.printedShirts;
        $scope.images = ShirtService.images;
        $scope.shirts = ShirtService.shirts;
        $scope.selectedImage = ShirtService.getLogo();
        // Sets an empty variable for shirt designs
        $scope.design = {};

        // Shows and Hides upload window
        $scope.uploadWindow = function () {
            $scope.showUpload = !$scope.showUpload;
        }

        // Sets up upload object for user image upload
        $scope.upload = {
            name: '',
            image: '',
            description: ''
        }

        // Used to hide quantity picker before saving design
        $scope.isSaved = false;

        // Pushes new image object to images array in ShirtService
        $scope.uploadImage = function (img) {
            $rootScope.myImages.$add(img);
            $scope.showUpload = !$scope.showUpload;
        }

        function setCoords() {
            var logo = {
                position: {
                    top: $('.image-div').position().top,
                    left: $('.image-div').position().left
                },
                size: {
                    height: $('.image-div').height(),
                    width: $('.image-div').width()
                }
            }
            console.log('logo', logo);
            $scope.design.logo = logo;
        }

        // Testing pasing data to a constructor for view change
        $scope.PassInfo = function (shirt, image) {
            console.log('shirt:', shirt, 'image:', image, '$scope.design', $scope.design)
            if (!image) {
                alert("You didnt create a design yet, please choose an image");
            }
            else {
                debugger
                setCoords();

                CreateService.currentCreation.tempShirt = shirt;
                CreateService.currentCreation.tempShirt.shirtUrl = $scope.shirtViewer;
                CreateService.currentCreation.tempImage = image;
                CreateService.currentCreation.tempDesign = $scope.design;
                CreateService.currentCreation.$save().then(function (ref) {
                    $state.go('savePage');
                }, function (err) { console.log("error:", err) })
            }
        }

        // Declares an empty object for save data
        $scope.saved = {
            name: '',
            email: ''
        }

        //Sets default values for logo object//These values need to match the css values for .image-div for proper operation
        $scope.design.logo = {
            position: {
                left: 159,
                top: 65
            },
            size: {
                height: 40,
                width: 40
            }
        }

        //Saves user designs to database 
        $scope.save = function () {
            if ($rootScope.member) {
                // alert($scope.saved.name + " has been saved to your account " + $rootScope.member.username);
            } else {
                alert("You must be logged in to save. Please login or create an account");
                $state.go('login')
            }


            $scope.design.details = {
                name: $scope.saved.name,
                email: $scope.saved.email,
                price: 19.99,
                user: $rootScope.member.username,
                date: Date.now(),
                shirtColor: CreateService.currentCreation.tempShirt.color,
                // needs work
                shirtUrl: CreateService.currentCreation.tempShirt.shirtUrl,

                // shirtUrl: CreateService.currentCreation.tempShirt.front,
                imageName: CreateService.currentCreation.tempImage.name,
                imageUrl: CreateService.currentCreation.tempImage.image,
            }
            //Perpetuating logo info on state change? Not sure im still using this...
            $scope.design.logo = {
                position: CreateService.currentCreation.tempDesign.logo.position,
                size: CreateService.currentCreation.tempDesign.logo.size
            }

            // Sends design to current users saved designs
            $rootScope.myDesigns.$add($scope.design);

            // Testing Firebase object for live design to get it off root
            CreateService.currentCreation.design = $scope.design;
            CreateService.currentCreation.$save()
            $scope.isSaved = true;
        }

        // Clears values & resets defaults for design//Mat not need
        function clearDesign() {
            $scope.design = {};
            $scope.design.details = {};
            $scope.design.logo = {
                position: {
                    left: 159,
                    top: 65
                },
                size: {
                    height: 40,
                    width: 40
                }
            }
        }

        // Assigns current order size info
        function getCount() {

        }

        // Get Item Sub Total
        $scope.getTotal = function () {
            var s = $scope.design.sizes
            var quantity = 0;
            for (var val in s) {
                quantity += s[val]
            }
            console.log("quantity", quantity);
            $scope.design.quantity = quantity;
            $scope.design.total = 0;
            $scope.design.total = $scope.design.details.price * quantity;
        }

        //Initializes cart total to 0 on page load
        $rootScope.myCart.cartTotal = 0;

        // Totals the price of all items in cart
        $scope.getCartTotal = function () {
            $rootScope.myCart.cartTotal = 0;
            var total = 0;
            for (var i = 0; i < $rootScope.myCart.length; i++) {
                total += $rootScope.myCart[i].total;
            }
            $rootScope.myCart.cartTotal = total;
        }

        // Keeps cart total up to date on content change
        $scope.$watch($rootScope.myCart, function (newValue) {
            $scope.getCartTotal();
        })

        // Keeps cart total up to date on view change
        $scope.$on('$stateChangeSuccess', function () {
            $scope.getCartTotal()
        });

        //Initializes total of items in cart on page load
        $scope.getCartTotal()

        //Adds current user design to cart
        $scope.addToCart = function () {
            $scope.getTotal();
            $rootScope.myCart.$add($scope.design);
            $state.go('tabsController.shoppingCart');
            $scope.isSaved = false;
            $scope.getCartTotal();
        }

        //Initializes Order object
        var currentOrder;
        function orderObjEmpty() {
            currentOrder = {
                items: [],
                orderDate: 0
            }
        }
        orderObjEmpty()

        //Creates order object for processing
        function createOrderObj(arr) {
            for (var i = 0; i < arr.length; i++) {
                currentOrder.items.push(arr[i]);
                currentOrder.orderDate = Date.now();
                currentOrder.email = $rootScope.member.username;
                currentOrder.grandTotal = $rootScope.myCart.cartTotal;
            }
        }

        // Clears cart after order
        function clearCart() {
            for (var i = 0; i < $rootScope.myCart.length; i++) {
                $rootScope.myCart.$remove(i)
            }
            $rootScope.myCart.cartTotal = 0;
        }

        // Processes order/sends to Firebase
        $scope.orderNow = function (info, total) {
            // test/dummy info
            !info ? info = { name: "John", cc_num: 12345678910, cc_cvc: 999 } : info = info;
            info.currency = total
            info.cc_exp_mo = 12;
            info.cc_exp_year = 2016;
            info.merch_acct_id_str = "154";
            // PayService.paymentApi(info).then(function (data, err) {
            //     console.log('orderpage: ' + data + '----err: ' + err)
            // })
            console.log("incoming from form", info)
            createOrderObj($rootScope.myCart);
            $scope.activeOrders.$add(currentOrder);
            alert("Payment processing is in progress.... Thank you for you Order! Thank you for participating in our testing phase. This order has been sent to the payment api and desktop application for processing");
            orderObjEmpty()
           
            // Clears the cart array
            clearCart();
        }

        // Removes an item from the cart
        $scope.removeFromCart = function (index) {
            console.log("remove from cart:", index);
            $rootScope.myCart.$remove(index).then(function (ref) {
                $scope.getCartTotal();
            }), function (err) { console.log("Firebase remove error:", err) };
        }


        // Add member designs to cart
        $scope.addMemberDesign = function (shirt) {
            // Need to create component for quantity picker
            alert('Thank you for participating in the pre-release test phase. This feature is coming soon in version 1.1')
        }

        //Selects clip art and scrolls to shirt designer
        $scope.imagePicker = function (i) {
            // console.log("Is this working? did you click ", i.name + "?");
            ShirtService.selectedImage = i;
            $scope.selectedImage = i;
            $ionicScrollDelegate.scrollTop();
        }

        // jQuery ui draggable resizable
        $('.image-div').resizable({
            aspectRatio: true,
            handles: 'ne,se,sw,nw',
            // stop: saveImage,
        }).draggable({
            // stop: function (e, image) {
            //     $scope.design.logo = $scope.design.logo || {};
            //     $scope.design.logo.position = image.position;
            // }
        });

        // jQuery text box draggable resizable
        $('.text-div').resizable({
            aspectRatio: true,
            handles: 'ne,se,sw,nw',
            //  stop: saveImage,
        }).draggable({
            //  stop: function(e, image) {
            //     $scope.design.logo = $scope.design.logo || {};
            //     $scope.design.logo.position = image.position;
            // }
        });

        // Working on visual enhancements
        // Toggle css handles on click
        // $scope.toggleHandles = function(){
        //     alert("I work!");
        //   $scope.active = !$scope.active;

        // }


        // Toggle hides image div
        // $(document).click(function() {
        //     $('#toggle').toggle('highlight')
        // })
        // End work on visual enhancements

        //Selects shirt color and view
        $scope.shirtView = function (view, shirt) {
            // console.log(shirt);
            if (shirt) {
                $scope.selectedShirt = shirt;
            }
            $scope.shirtViewer = $scope.selectedShirt[view];;
            // console.log(view);
        }

        // Initializes Shirt View
        $scope.shirtView('front', ShirtService.shirts[0])

        // Saves selected image 
        function saveImage(e, image) {
            console.log("save image:", image)
            var logo = {
                size: image.size,
                position: image.position
            }
            $scope.design.logo = logo;
        }

        // Printed shirt picker
        // $rootScope.printOrder = {};
        $scope.printedShirts = ShirtService.printedShirts;
        $scope.buyPrint = function (print) {
            // alert("running buy prints function.... shirt is:", print);
            console.log(print)
            console.log("printOrder:", $scope.printOrder)
            $scope.printOrder.details = {
                price: print.price,
                shirtUrl: print.url,
                color: print.color,
                name: print.name,
                description: print.description,
                // total: 0
            }
            OrderService.printOrder = $scope.printOrder
            console.log("this is the OrderService.printOrder Post function:", OrderService.printOrder)
            // console.log($rootScope.printOrder)
            $state.go('savePage');
        }
    })

    .controller('shoppingCartCtrl', function ($scope, ShirtService, OrderService, DBREF, $firebaseArray, $rootScope) {


    })

    // For Refactor 
    .controller('chooseCustomClipArtCtrl', function ($scope) {

    })

    // Not currently in use. Preparing for refactor
    .controller('brandedPrintsCtrl', function ($scope, ShirtService, $state) {
        $scope.printedShirts = ShirtService.printedShirts;
        $scope.buyPrint = function () {
            alert("running buy prints function")
            // $state.go('quantityPage');
            // need to link this back to quantity function on save page with shirt data
            $scope.isSaved = true;
        }

    })

    // Might not use this controller
    .controller('savePageCtrl', function ($scope) {
        $scope.test = "Save Test";
    })
