<script setup lang="ts">
import { Card, Badge, Button, Icon } from '@/components/ui'

// Dummy card data
const cardDetails = {
  brand: 'Visa',
  last4: '4242',
  expMonth: 12,
  expYear: 2026,
}

// Dummy invoices
const invoices = [
  { id: 'inv_001', date: '2024-12-01', amount: 6.00, status: 'paid' },
  { id: 'inv_002', date: '2024-11-01', amount: 6.00, status: 'paid' },
  { id: 'inv_003', date: '2024-10-01', amount: 6.00, status: 'paid' },
  { id: 'inv_004', date: '2024-09-01', amount: 6.00, status: 'paid' },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <Card>
    <Card.Header
      title="Billing"
      icon="lni-credit-card-1"
    />
    <Card.Content class="space-y-6">
      <!-- Payment Method -->
      <div class="space-y-3">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Payment Method
        </p>
        <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
              <span class="text-white text-[10px] font-bold">VISA</span>
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">
                {{ cardDetails.brand }} ending in {{ cardDetails.last4 }}
              </p>
              <p class="text-xs text-muted-foreground">
                Expires {{ cardDetails.expMonth }}/{{ cardDetails.expYear }}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
          >
            Update
          </Button>
        </div>
      </div>

      <!-- Invoices -->
      <div class="space-y-3">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Past Invoices
        </p>
        <div class="border border-border rounded-lg overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="bg-muted/50 text-xs text-muted-foreground">
                <th class="text-left px-3 py-2 font-medium">
                  Date
                </th>
                <th class="text-left px-3 py-2 font-medium">
                  Amount
                </th>
                <th class="text-left px-3 py-2 font-medium">
                  Status
                </th>
                <th class="text-right px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                v-for="invoice in invoices"
                :key="invoice.id"
                class="text-sm"
              >
                <td class="px-3 py-2.5 text-foreground">
                  {{ formatDate(invoice.date) }}
                </td>
                <td class="px-3 py-2.5 text-foreground">
                  ${{ invoice.amount.toFixed(2) }}
                </td>
                <td class="px-3 py-2.5">
                  <Badge
                    variant="success"
                    size="xs"
                  >
                    Paid
                  </Badge>
                </td>
                <td class="px-3 py-2.5 text-right">
                  <Button
                    variant="ghost"
                    size="xs"
                  >
                    <Icon
                      name="lni-download-1"
                      class="text-xs"
                    />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card.Content>
  </Card>
</template>
