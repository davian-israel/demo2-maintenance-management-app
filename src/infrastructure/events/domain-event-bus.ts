export type DomainEvent = {
  type: string;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export class InMemoryDomainEventBus {
  private readonly events: DomainEvent[] = [];

  publish(event: DomainEvent) {
    this.events.push(event);
  }

  list() {
    return [...this.events];
  }
}
