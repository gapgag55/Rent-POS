from odoo import models, api, fields
from datetime import datetime, timedelta


class ServiceOrder(models.Model):
    _inherit = 'pos.order'

    rent = fields.Boolean(string='Rent', default=False)
    return_back = fields.Boolean(string='Return', default=False)
    checkin = fields.Datetime(string='Check In', default=fields.datetime.now())
    checkout = fields.Datetime(string='Check Out', default=fields.datetime.now())

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

    @api.one
    def service_checkout(self):
        self.return_back = True