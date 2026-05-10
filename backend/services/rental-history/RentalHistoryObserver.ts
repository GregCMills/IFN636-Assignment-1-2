import RentalHistory, { RentalHistoryDocument } from '../../models/RentalHistory';

/**
 * RentalCompletionObserver — interface for objects that react to rental completions.
 * Implementations record, log, notify, or otherwise respond to completed rentals.
 */
export interface RentalCompletionObserver {
  onRentalCompleted(event: RentalCompletionEvent): Promise<void>;
}

/**
 * RentalCompletionEvent — data passed to observers when a rental is completed.
 * Emitted when an asset transitions from 'Pending Return' to 'Available' or 'Maintenance'.
 */
export interface RentalCompletionEvent {
  assetId: string;
  typeId: string;
  assetName: string;
  assetTypeName: string;
  rentedByUserId: string;
  rentApprovedAt?: string;
  rentDate?: string;
  returnDate: string;
  finalStatus: 'Available' | 'Maintenance';
}

/**
 * RentalCompletionSubject — manages observers and notifies them of rental completions.
 */
export class RentalCompletionSubject {
  private observers: RentalCompletionObserver[] = [];

  subscribe(observer: RentalCompletionObserver): void {
    this.observers.push(observer);
  }

  async notify(event: RentalCompletionEvent): Promise<void> {
    await Promise.all(this.observers.map(obs => obs.onRentalCompleted(event)));
  }
}

/**
 * MongoRentalHistoryRecorder — concrete observer that persists rental completions to MongoDB.
 * Implements RentalCompletionObserver to record completed rentals in the RentalHistory collection.
 */
export class MongoRentalHistoryRecorder implements RentalCompletionObserver {
  async onRentalCompleted(event: RentalCompletionEvent): Promise<void> {
    await RentalHistory.create({
      assetId: event.assetId,
      typeId: event.typeId,
      assetName: event.assetName,
      assetTypeName: event.assetTypeName,
      rentedByUserId: event.rentedByUserId,
      returnDate: event.returnDate,
      finalStatus: event.finalStatus,
      completedAt: new Date().toISOString(),
      ...(event.rentApprovedAt ? { rentApprovedAt: event.rentApprovedAt } : {}),
      ...(event.rentDate ? { rentDate: event.rentDate } : {}),
    });
  }
}

/**
 * Global singleton subject for rental completions.
 * Initialized with the MongoDB recorder already subscribed.
 */
export const rentalCompletionSubject = new RentalCompletionSubject();
rentalCompletionSubject.subscribe(new MongoRentalHistoryRecorder());
