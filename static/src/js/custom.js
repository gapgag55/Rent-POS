odoo.define('service.order', function (require) {
  "use strict";

  var screens = require('point_of_sale.screens');
  var models = require('point_of_sale.models');
  var gui = require('point_of_sale.gui');
  var core = require('web.core');
  var rpc = require('web.rpc');

  var QWeb = core.qweb;
  var _t = core._t;

  models.load_models({
    model: 'pos.order',
    fields: ['id', 'name', 'checkin', 'checkout', 'rent', 'return_back'],
    domain: function (self) {
      return [['rent', '=', true]];
    },
    loaded: function (self, orders) {
      self.orders = orders;
    },
  });

  var _super_order = models.Order.prototype;
  models.Order = models.Order.extend({
    initialize: function (attr, options) {
      _super_order.initialize.call(this, attr, options);
      this.rent = true;
    },
    set_rent: function () {
      this.rent = true;
    },
    cancel_rent: function () {
      this.rent = false;
    },
    export_as_JSON: function () {
      var json = _super_order.export_as_JSON.apply(this, arguments);
      json.rent = this.rent;
      return json;
    },
    init_from_JSON: function (json) {
      _super_order.init_from_JSON.apply(this, arguments);
      this.rent = json.rent;
    },
  });

  var ServiceOrdersWidget = screens.ScreenWidget.extend({
    template: 'ServiceScreenWidget',
    show: function () {
      var self = this;
      this._super();

      this.$('.back').click(function () {
        self.gui.back();
      }); 

      this.render_services(this.pos.orders)
    },
    render_services: function (orders) {
      var contents = this.$el[0].querySelector('.client-list-contents');
      contents.innerHTML = "";
      for (var i = 0, len = Math.min(orders.length, 1000); i < len; i++) {

        if (orders[i].return_back) continue;

        var clientline_html = QWeb.render('OrderLine', { widget: this, order: orders[i] });
        var clientline = document.createElement('tbody');
        clientline.innerHTML = clientline_html;
        clientline = clientline.childNodes[1];

        contents.appendChild(clientline);
      }

      this.$('.checkout').click(function () {

        var id = $(this).data('id')
        var order = {};

        for (var i = 0; i < orders.length; i++) {
          if (orders[i].id == id) {
            order = orders[i];
            break;
          }
        }

        if ($(this).hasClass('clicked')) {
          // Cancel Checkout 
          order.return_back = false
          $(this).removeClass('clicked')
        } else {
          // Checkout
          order.return_back = true
          $(this).addClass('clicked')
        }

        rpc.query({
          model: 'pos.order',
          method: 'update_rent',
          args: [order],
        })
      });
    }
  });

  gui.define_screen({
    name: 'service_orders',
    widget: ServiceOrdersWidget
  });

  var CheckoutButton = screens.ActionButtonWidget.extend({
    template: 'CheckoutButton',
    button_click: function () {
      var self = this
      rpc.query({
        model: 'pos.order',
        method: 'retreive_data',
      }).then(function (data) {
        self.pos.orders = JSON.parse(data)
        self.gui.show_screen('service_orders');
      })
    },
  });

  var CheckinButton = screens.ActionButtonWidget.extend({
    template: 'CheckinButton',
    button_click: function () {
      var order = this.pos.get_order()
      order.set_rent()
      this.gui.show_screen('payment');
    },
  });

  screens.define_action_button({
    'name': 'checkout',
    'widget': CheckoutButton,
  });

  screens.define_action_button({
    'name': 'checkin',
    'widget': CheckinButton,
  });
});
