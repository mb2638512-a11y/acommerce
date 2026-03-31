import { env, isProduction } from '../config/env';

/**
 * EasyPost API Client for Shipping Operations
 * Supports shipping rates, label creation, and tracking
 */

// EasyPost API base URL
const EASYPOST_API_URL = 'https://api.easypost.com/v2';
const EASYPOST_TEST_API_URL = 'https://api.easypost.com/v2';

/**
 * Address interface for shipping
 */
export interface ShippingAddress {
 name?: string;
 street1: string;
 street2?: string;
 city?: string;
 state?: string;
 zip?: string;
 country?: string;
 phone?: string;
 email?: string;
 company?: string;
}

/**
 * Parcel dimensions interface
 */
export interface ParcelDimensions {
 length: number;
 width: number;
 height: number;
 weight: number; // in ounces
}

/**
 * Shipping rate interface
 */
export interface ShippingRate {
 id: string;
 carrier: string;
 service: string;
 rate: number;
 currency: string;
 deliveryDays?: number;
 deliveryDate?: string;
 estDeliveryDays?: number;
}

/**
 * Shipping label interface
 */
export interface ShippingLabel {
 id: string;
 trackingNumber: string;
 trackingUrl: string;
 labelUrl: string;
 labelFormat: 'PNG' | 'PDF' | 'ZPL';
 carrier: string;
 service: string;
 rate: number;
}

/**
 * Shipment tracking interface
 */
export interface TrackingInfo {
 status: string;
 statusDetail?: string;
 carrier: string;
 trackingNumber: string;
 trackingUrl: string;
 estimatedDelivery?: string;
 actualDelivery?: string;
 shipmentProgress?: TrackingEvent[];
}

/**
 * Tracking event interface
 */
export interface TrackingEvent {
 status: string;
 message?: string;
 location?: string;
 timestamp?: string;
}

/**
 * Address validation result
 */
export interface AddressValidationResult {
 isValid: boolean;
 standardizedAddress?: ShippingAddress;
 errors?: string[];
 warnings?: string[];
}

/**
 * Carrier interface
 */
export interface Carrier {
 id: string;
 name: string;
 logo?: string;
 services: string[];
}

/**
 * EasyPost response wrapper
 */
interface EasyPostResponse {
 id: string;
 [key: string]: unknown;
}

/**
 * Shipping Service class for EasyPost integration
 */
export class ShippingService {
 private apiKey: string;
 private baseUrl: string;

 constructor(testMode: boolean = !isProduction) {
  // Use test API key in development, production key in production
  this.apiKey = testMode
   ? (env.easyPostTestApiKey || env.easyPostApiKey)
   : env.easyPostApiKey;
  this.baseUrl = testMode ? EASYPOST_TEST_API_URL : EASYPOST_API_URL;
 }

 /**
  * Make API request to EasyPost
  */
 private async makeRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: Record<string, unknown>
 ): Promise<EasyPostResponse> {
  if (!this.apiKey) {
   throw new Error('EasyPost API key is not configured. Please set EASYPOST_API_KEY environment variable.');
  }

  const url = `${this.baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
   'Content-Type': 'application/json',
   'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
  };

  try {
   const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
   });

   if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `EasyPost API error: ${response.status}`);
   }

   return await response.json();
  } catch (error) {
   if (error instanceof Error) {
    throw new Error(`Shipping API request failed: ${error.message}`);
   }
   throw new Error('Shipping API request failed: Unknown error');
  }
 }

 /**
  * Convert internal address to EasyPost format
  */
 private toEasyPostAddress(address: ShippingAddress): Record<string, unknown> {
  return {
   name: address.name,
   street1: address.street1,
   street2: address.street2 || undefined,
   city: address.city,
   state: address.state,
   zip: address.zip,
   country: address.country || 'US',
   phone: address.phone,
   email: address.email,
   company: address.company,
  };
 }

 /**
  * Convert internal parcel to EasyPost format
  */
 private toEasyPostParcel(parcel: ParcelDimensions): Record<string, unknown> {
  return {
   length: parcel.length,
   width: parcel.width,
   height: parcel.height,
   weight: parcel.weight,
  };
 }

 /**
  * Get shipping rates for a shipment
  */
 async getShippingRates(
  addressFrom: ShippingAddress,
  addressTo: ShippingAddress,
  parcel: ParcelDimensions
 ): Promise<ShippingRate[]> {
  try {
   const response = await this.makeRequest('/shipments', 'POST', {
    shipment: {
     from_address: this.toEasyPostAddress(addressFrom),
     to_address: this.toEasyPostAddress(addressTo),
     parcel: this.toEasyPostParcel(parcel),
    },
   });

   const rates = response.rates as Array<{
    id: string;
    carrier: string;
    service: string;
    rate: string;
    currency: string;
    delivery_days?: number;
    delivery_date?: string;
    est_delivery_days?: number;
   }>;

   return rates.map((rate) => ({
    id: rate.id,
    carrier: rate.carrier,
    service: rate.service,
    rate: parseFloat(rate.rate),
    currency: rate.currency,
    deliveryDays: rate.delivery_days,
    deliveryDate: rate.delivery_date,
    estDeliveryDays: rate.est_delivery_days,
   }));
  } catch (error) {
   if (error instanceof Error) {
    throw new Error(`Failed to get shipping rates: ${error.message}`);
   }
   throw new Error('Failed to get shipping rates: Unknown error');
  }
 }

 /**
  * Create a shipment and buy a shipping label
  */
 async createShippingLabel(
  addressFrom: ShippingAddress,
  addressTo: ShippingAddress,
  parcel: ParcelDimensions,
  carrier: string,
  service: string,
  labelFormat: 'PNG' | 'PDF' | 'ZPL' = 'PDF'
 ): Promise<ShippingLabel> {
  try {
   const response = await this.makeRequest('/shipments', 'POST', {
    shipment: {
     from_address: this.toEasyPostAddress(addressFrom),
     to_address: this.toEasyPostAddress(addressTo),
     parcel: this.toEasyPostParcel(parcel),
     carrier,
     service,
    },
   });

   // Buy the label
   const buyResponse = await this.makeRequest(`/shipments/${response.id}/buy`, 'POST', {
    rate: {
     carrier,
     service,
    },
   });

   const shipment = buyResponse as EasyPostResponse & {
    tracking_code?: string;
    tracker?: { public_url?: string };
    postage_label?: { label_url?: string };
    selected_rate?: { carrier?: string; service?: string; rate?: string };
   };

   return {
    id: shipment.id,
    trackingNumber: shipment.tracking_code || '',
    trackingUrl: shipment.tracker?.public_url || '',
    labelUrl: shipment.postage_label?.label_url || '',
    labelFormat,
    carrier,
    service,
    rate: parseFloat(shipment.selected_rate?.rate || '0'),
   };
  } catch (error) {
   if (error instanceof Error) {
    throw new Error(`Failed to create shipping label: ${error.message}`);
   }
   throw new Error('Failed to create shipping label: Unknown error');
  }
 }

 /**
  * Buy a shipping label using a rate ID
  */
 async buyLabelWithRate(rateId: string): Promise<ShippingLabel> {
  try {
   // First, get the shipment from the rate
   const shipmentId = rateId.split('_')[0];
   const response = await this.makeRequest(`/shipments/${shipmentId}/buy`, 'POST', {
    rate: { id: rateId },
   });

   const shipment = response as EasyPostResponse & {
    tracking_code?: string;
    tracker?: { public_url?: string };
    postage_label?: { label_url?: string };
    selected_rate?: { carrier?: string; service?: string; rate?: string };
   };

   return {
    id: shipment.id,
    trackingNumber: shipment.tracking_code || '',
    trackingUrl: shipment.tracker?.public_url || '',
    labelUrl: shipment.postage_label?.label_url || '',
    labelFormat: 'PDF',
    carrier: shipment.selected_rate?.carrier || '',
    service: shipment.selected_rate?.service || '',
    rate: parseFloat(shipment.selected_rate?.rate || '0'),
   };
  } catch (error) {
   if (error instanceof Error) {
    throw new Error(`Failed to buy shipping label: ${error.message}`);
   }
   throw new Error('Failed to buy shipping label: Unknown error');
  }
 }

 /**
  * Track a shipment by tracking number and carrier
  */
 async trackShipment(trackingNumber: string, carrier: string): Promise<TrackingInfo> {
  try {
   const response = await this.makeRequest('/trackers', 'POST', {
    tracker: {
     tracking_code: trackingNumber,
     carrier,
    },
   });

   const tracker = response as EasyPostResponse & {
    status?: string;
    status_detail?: string;
    public_url?: string;
    est_delivery_date?: string;
    tracking_details?: Array<{
     status?: string;
     message?: string;
     tracking_location?: {
      city?: string;
      state?: string;
      country?: string;
     };
     datetime?: string;
    }>;
   };

   const progress: TrackingEvent[] = (tracker.tracking_details || []).map((detail) => ({
    status: detail.status || '',
    message: detail.message,
    location: detail.tracking_location
     ? `${detail.tracking_location.city || ''}, ${detail.tracking_location.state || ''} ${detail.tracking_location.country || ''}`
     : undefined,
    timestamp: detail.datetime,
   }));

   return {
    status: tracker.status || 'unknown',
    statusDetail: tracker.status_detail,
    carrier,
    trackingNumber,
    trackingUrl: tracker.public_url || '',
    estimatedDelivery: tracker.est_delivery_date,
    shipmentProgress: progress,
   };
  } catch (error) {
   if (error instanceof Error) {
    throw new Error(`Failed to track shipment: ${error.message}`);
   }
   throw new Error('Failed to track shipment: Unknown error');
  }
 }

 /**
  * Validate an address
  */
 async validateAddress(address: ShippingAddress): Promise<AddressValidationResult> {
  try {
   const response = await this.makeRequest('/addresses', 'POST', {
    address: {
     ...this.toEasyPostAddress(address),
     verify: ['delivery'],
    },
   });

   const easyPostAddress = response as EasyPostResponse & {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    verifications?: {
     delivery?: {
      success: boolean;
      errors?: Array<{ message: string }>;
     };
    };
   };

   const verification = easyPostAddress.verifications?.delivery;
   const isValid = verification?.success || false;
   const errors = verification?.errors?.map((e) => e.message);

   if (isValid) {
    return {
     isValid: true,
     standardizedAddress: {
      name: address.name,
      street1: easyPostAddress.street1 || address.street1,
      street2: easyPostAddress.street2,
      city: easyPostAddress.city,
      state: easyPostAddress.state,
      zip: easyPostAddress.zip,
      country: easyPostAddress.country,
      phone: address.phone,
      email: address.email,
     },
     errors: errors?.length ? errors : undefined,
    };
   }

   return {
    isValid: false,
    errors: errors || ['Address validation failed'],
   };
  } catch (error) {
   if (error instanceof Error) {
    return {
     isValid: false,
     errors: [error.message],
    };
   }
   return {
    isValid: false,
    errors: ['Address validation failed: Unknown error'],
   };
  }
 }

 /**
  * Get list of available carriers
  */
 async getCarriers(): Promise<Carrier[]> {
  // Return standard carriers supported by EasyPost
  // In production, you might want to fetch this from the API
  return [
   {
    id: 'ups',
    name: 'UPS',
    services: [
     'Ground',
     'Next Day Air',
     'Next Day Air Early',
     'Next Day Air Saver',
     '2nd Day Air',
     '2nd Day Air AM',
     '3 Day Select',
     'Worldwide Express',
     'Worldwide Expedited',
    ],
   },
   {
    id: 'fedex',
    name: 'FedEx',
    services: [
     'Ground',
     'Express Saver',
     '2Day',
     '2Day AM',
     'Priority Overnight',
     'Standard Overnight',
     'First Overnight',
     'International Priority',
     'International Economy',
    ],
   },
   {
    id: 'usps',
    name: 'USPS',
    services: [
     'Priority Mail',
     'Priority Mail Express',
     'Priority Mail Express International',
     'Priority Mail International',
     'First Class Mail',
     'First Class Package International',
     'Parcel Select',
     'Media Mail',
    ],
   },
   {
    id: 'dhl_express',
    name: 'DHL Express',
    services: [
     'Express Worldwide',
     'Express 12:00',
     'Economy Select',
     'Domestic Express',
    ],
   },
   {
    id: 'amazon_shipping',
    name: 'Amazon Shipping',
    services: ['Amazon Prime', 'Amazon Standard'],
   },
   {
    id: 'ontrac',
    name: 'OnTrac',
    services: ['Ground', 'Sunrise', 'PrioSave'],
   },
   {
    id: 'lasership',
    name: 'LaserShip',
    services: ['Standard', 'Express', 'Rush'],
   },
   {
    id: 'penske',
    name: 'Penske',
    services: ['Standard', 'Express', 'Expedited'],
   },
   {
    id: 'publix',
    name: 'Publix',
    services: ['Delivery', 'Express'],
   },
   {
    id: 'costco',
    name: 'Costco',
    services: ['Standard', 'Express'],
   },
   {
    id: 'walmart',
    name: 'Walmart',
    services: ['Standard', 'Express', 'Next Day'],
   },
   {
    id: 'homedepot',
    name: 'Home Depot',
    services: ['Standard', 'Express'],
   },
   {
    id: 'lowes',
    name: "Lowe's",
    services: ['Standard', 'Express'],
   },
   {
    id: 'dhl_ecommerce',
    name: 'DHL eCommerce',
    services: ['Parcel Plus', 'Parcel Expedited', 'Parcel Ground'],
   },
   {
    id: 'globegistics',
    name: 'Globegistics',
    services: ['Economy', 'Standard', 'Express'],
   },
   {
    id: 'gso',
    name: 'GSO',
    services: ['Standard', 'Express', 'PrioSave'],
   },
   {
    id: 'newgistics',
    name: 'Newgistics',
    services: ['Standard', 'Express'],
   },
   {
    id: 'estes',
    name: 'Estes',
    services: ['Ground', 'Express', 'Expedited'],
   },
   {
    id: 'rr_donnelley',
    name: 'RR Donnelley',
    services: ['Standard', 'Express'],
   },
   {
    id: 'speedee',
    name: 'SpeeDEE',
    services: ['Standard', 'Express'],
   },
   {
    id: 'tforce',
    name: 'TForce',
    services: ['Freight', 'Small Package'],
   },
  ];
 }

 /**
  * Create a shipment object (without purchasing)
  */
 async createShipment(
  addressFrom: ShippingAddress,
  addressTo: ShippingAddress,
  parcel: ParcelDimensions
 ): Promise<{ id: string; rates: ShippingRate[] }> {
  try {
   const response = await this.makeRequest('/shipments', 'POST', {
    shipment: {
     from_address: this.toEasyPostAddress(addressFrom),
     to_address: this.toEasyPostAddress(addressTo),
     parcel: this.toEasyPostParcel(parcel),
    },
   });

   const rates = response.rates as Array<{
    id: string;
    carrier: string;
    service: string;
    rate: string;
    currency: string;
    delivery_days?: number;
    est_delivery_days?: number;
   }>;

   return {
    id: response.id,
    rates: rates.map((rate) => ({
     id: rate.id,
     carrier: rate.carrier,
     service: rate.service,
     rate: parseFloat(rate.rate),
     currency: rate.currency,
     deliveryDays: rate.delivery_days,
     estDeliveryDays: rate.est_delivery_days,
    })),
   };
  } catch (error) {
   if (error instanceof Error) {
    throw new Error(`Failed to create shipment: ${error.message}`);
   }
   throw new Error('Failed to create shipment: Unknown error');
  }
 }

 /**
  * Get shipment details by ID
  */
 async getShipment(shipmentId: string): Promise<EasyPostResponse> {
  try {
   return await this.makeRequest(`/shipments/${shipmentId}`, 'GET');
  } catch (error) {
   if (error instanceof Error) {
    throw new Error(`Failed to get shipment: ${error.message}`);
   }
   throw new Error('Failed to get shipment: Unknown error');
  }
 }

 /**
  * Cancel a shipment
  */
 async cancelShipment(shipmentId: string): Promise<boolean> {
  try {
   await this.makeRequest(`/shipments/${shipmentId}/cancel`, 'POST');
   return true;
  } catch (error) {
   // Some shipments cannot be cancelled
   return false;
  }
 }

 /**
  * Refund a shipment
  */
 async refundShipment(shipmentId: string): Promise<boolean> {
  try {
   await this.makeRequest(`/shipments/${shipmentId}/refund`, 'POST');
   return true;
  } catch (error) {
   return false;
  }
 }
}

// Default export - create instance based on environment
export const shippingService = new ShippingService();

// Export individual functions for convenience
export const getShippingRates = (
 addressFrom: ShippingAddress,
 addressTo: ShippingAddress,
 parcel: ParcelDimensions
): Promise<ShippingRate[]> => shippingService.getShippingRates(addressFrom, addressTo, parcel);

export const createShippingLabel = (
 addressFrom: ShippingAddress,
 addressTo: ShippingAddress,
 parcel: ParcelDimensions,
 carrier: string,
 service: string,
 labelFormat?: 'PNG' | 'PDF' | 'ZPL'
): Promise<ShippingLabel> =>
 shippingService.createShippingLabel(addressFrom, addressTo, parcel, carrier, service, labelFormat);

export const trackShipment = (
 trackingNumber: string,
 carrier: string
): Promise<TrackingInfo> => shippingService.trackShipment(trackingNumber, carrier);

export const getCarriers = (): Promise<Carrier[]> => shippingService.getCarriers();

export const validateAddress = (
 address: ShippingAddress
): Promise<AddressValidationResult> => shippingService.validateAddress(address);

export const createShipment = (
 addressFrom: ShippingAddress,
 addressTo: ShippingAddress,
 parcel: ParcelDimensions
): Promise<{ id: string; rates: ShippingRate[] }> =>
 shippingService.createShipment(addressFrom, addressTo, parcel);

export const buyLabelWithRate = (rateId: string): Promise<ShippingLabel> =>
 shippingService.buyLabelWithRate(rateId);

export const getShipment = (shipmentId: string): Promise<EasyPostResponse> =>
 shippingService.getShipment(shipmentId);

export const cancelShipment = (shipmentId: string): Promise<boolean> =>
 shippingService.cancelShipment(shipmentId);

export const refundShipment = (shipmentId: string): Promise<boolean> =>
 shippingService.refundShipment(shipmentId);
