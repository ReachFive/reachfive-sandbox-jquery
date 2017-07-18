reach5('on', 'authenticated', function(authResult) {
  console.log(authResult);
  $.jStorage.set("accessToken", authResult.accessToken);
  $.jStorage.set("user", authResult.idTokenPayload);

  window.history.replaceState("", document.title,"/"),
  Demo.home();
});

var Demo = (function() {
  var $m;
  function init() {
      $m = $('#main');
      $('#logout').on('click', logout);
      $('#retour').on('click', home);
      $('#registration').on('click', function () {sign("signup")});
      $('#connection').on('click', function () {sign("login")});
      $('#fullname').on('click', account);
      home();
  }

  function home() {
    $m.empty().load('html/home.html', function() {
      $('#order').on('click', function () {sign("login")});
    });

    var user = $.jStorage.get("user");
    if (user) {
      $('li.retour, li.menu').hide();
      $('li.logged').show();
      $('#fullname').text(user.name);
    }
    else {
      $('li.retour, li.logged').hide();
      $('li.menu').show();
    }
  }

  function sign(is) {
    $m.empty().load('html/widget.html', function() {

      $('li.menu').hide();
      $('li.retour').show();

      reach5('showAuth', {
        initialScreen: is,
        container: 'reach5-widget',
        auth: {
          origin: 'Homepage'
        }
      });
    });
  }

  function account() {
    $m.empty().load("html/widget.html", function() {

      $('li.logged').hide();
      $('li.retour').show();

      var accessToken = $.jStorage.get("accessToken");
      if (accessToken) {
        reach5('showProfileEditor', {
          container: 'reach5-widget',
          showLabels: true,
          fields: [
            "given_name",
            "family_name",
            "email",
            "birthdate"
          ],
          accessToken
        });

        reach5('on', 'profile_updated', function() {
          reach5('getUser', {
                accessToken: accessToken,
                fields: 'id,email,name,gender,birthdate,last_login_provider,created_at,updated_at'
            },
            function(err, user) {
              if (err) {
                console.error(err);
                return;
              }
              console.log(user);
              $.jStorage.set("user", user);
              home();
            });
        });
      }
      else {
        console.error("Aucun utilisateur connecté");
      }
    });
  }

  function logout() {
    $.jStorage.deleteKey("user");
    $.jStorage.deleteKey("accessToken");
    reach5('logout');
  }

  return {
    init: init,
    home: home
  };
})();

$(document).ready(function () {
    Demo.init();
});
