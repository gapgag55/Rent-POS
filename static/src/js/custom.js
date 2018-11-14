odoo.define('service.order', function (require) {
  "use strict";

  var screens = require('point_of_sale.screens');
  var models = require('point_of_sale.models');
  var gui = require('point_of_sale.gui');
  var core = require('web.core');

  var QWeb = core.qweb;
  var _t = core._t;

  // models.load_models({
  //   model: 'pos.order',
  //   fields: ['id', 'name', 'checkin', 'checkout'],
  //   domain: function (self) {
  //     return [['rent', '=', true]];
  //   },
  //   loaded: function (self, orders) {
  //     self.orders = orders
  //   },
  // });

  var _super_order = models.Order.prototype;
  models.Order = models.Order.extend({
    initialize: function (attr, options) {
      _super_order.initialize.call(this, attr, options);
      this.rent = true;
    },
    set_rent: function () {
      this.rent = true;
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

  // var ServiceOrdersWidget = screens.ScreenWidget.extend({
  //   template: 'ServiceOrdersWidget',
  //   show: function () {
  //     var self = this;
  //     this._super();

  //     // this.renderElement();

  //     this.$('.back').click(function () {
  //       self.gui.back();
  //     });

  //     this.render_services(this.pos.orders)
  //     // var partners = this.pos.db.get_partners_sorted(1000);
  //   },
  //   render_services: function (orders) {
  //     var contents = this.$el[0].querySelector('.client-list-contents');
  //     contents.innerHTML = "";
  //     for(var i = 0, len = Math.min(orders.length,1000); i < len; i++){
  //         var order = orders[i];
  //         var clientline_html = QWeb.render('OrderLine',{widget: this, order:orders[i]});
  //         var clientline = document.createElement('tbody');
  //         clientline.innerHTML = clientline_html;
  //         clientline = clientline.childNodes[1];
  //         this.partner_cache.cache_node(order.id, clientline);
          
  //         contents.appendChild(clientline);
  //     }
  //   }
  // });

  // gui.define_screen({
  //   name: 'service_orders',
  //   widget: ServiceOrdersWidget
  // });

  var CheckoutButton = screens.ActionButtonWidget.extend({
    template: 'CheckoutButton',
    button_click: function () {
      // Your code Here
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