export interface Subscription {
    id: number
    service: string
    price: number | null
    currency: string
    period: string
    next_billing_date: string
}

interface SubscriptionForm = Omit<Subscription, 'id'> {
    service: string
    price: number | null
    currency: string
    period: string
    nextBillingDate: any
}