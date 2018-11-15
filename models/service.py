from odoo import models, api, fields
from datetime import datetime, timedelta
import json

class ServiceOrder(models.Model):
    _inherit = 'pos.order'

    rent = fields.Boolean(string='Rent', default=False)
    return_back = fields.Boolean(string='Return', default=False)
    checkin = fields.Datetime(string='Check In', default=fields.datetime.now() + timedelta(hours=7))
    checkout = fields.Datetime(string='Check Out', default=fields.datetime.now() + timedelta(days=1, hours=7))

    @api.model
    def _order_fields(self, ui_order):
      res = super(ServiceOrder, self)._order_fields(ui_order)
      res['rent'] = ui_order.get('rent')
      return res
      
    @api.model
    def update_rent(self, service):
      service_id = service.pop('id', False)
      if service_id:
        self.browse(service_id).write(service)

    @api.model
    def retreive_data(self):
      datas = []
      for r in self.search([]):
        data = {}
        # return_back: false, rent: true, checkout: "2018-11-16 20:44:51", checkin: "2018-11-15 20:44:51", id: 103
        data['id'] = r.id
        data['name'] = r.name
        data['return_back'] = r.return_back
        data['checkout'] = r.checkout
        data['checkin'] = r.checkin
        data['rent'] = r.rent

        datas.append(data)
        
      return json.dumps(datas)

    @api.one
    def service_checkout(self):
        self.return_back = True