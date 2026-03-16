export const orderStats = {
  new: 4,
  shipped: 11,
  delivered: 38,
}

export interface Order {
  id: string
  customer: string
  email: string
  item: string
  quantity: number
  amount: string
  status: 'New' | 'Shipped' | 'Delivered'
  date: string
  address: string
  notes?: string
}

export const recentOrders: Order[] = [
  { id: '#1042', customer: 'Sophie M.', email: 'sophie@example.com', item: 'Hand-woven Tote', quantity: 1, amount: '$48.00', status: 'New', date: 'Mar 14, 2026', address: '142 Laurier Ave, Montreal, QC H2T 2N7' },
  { id: '#1041', customer: 'James R.', email: 'james@example.com', item: 'Linen Scarf', quantity: 2, amount: '$64.00', status: 'New', date: 'Mar 13, 2026', address: '88 King St W, Toronto, ON M5H 1J9' },
  { id: '#1040', customer: 'Clara B.', email: 'clara@example.com', item: 'Ceramic Mug', quantity: 1, amount: '$24.00', status: 'Shipped', date: 'Mar 10, 2026', address: '300 Georgia St, Vancouver, BC V6B 6B4', notes: 'Leave at door' },
  { id: '#1039', customer: 'Tom K.', email: 'tom@example.com', item: 'Hand-woven Tote', quantity: 1, amount: '$48.00', status: 'Delivered', date: 'Mar 5, 2026', address: '1000 De La Gauchetière W, Montreal, QC H3B 4W5' },
  { id: '#1038', customer: 'Nina L.', email: 'nina@example.com', item: 'Linen Scarf', quantity: 1, amount: '$32.00', status: 'Delivered', date: 'Mar 1, 2026', address: '555 Robson St, Vancouver, BC V6B 2B6' },
  { id: '#1037', customer: 'Marc D.', email: 'marc@example.com', item: 'Ceramic Mug', quantity: 3, amount: '$72.00', status: 'Delivered', date: 'Feb 28, 2026', address: '22 Front St E, Toronto, ON M5E 1C4' },
]
