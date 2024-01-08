import * as SecureStore from "expo-secure-store";
import PocketBase, { BaseAuthStore } from "pocketbase";

class AsyncAuthStore extends BaseAuthStore {
  storageKey: string;
  queue: Array<() => Promise<any>>;

  constructor(storageKey = "pb_auth") {
    super();

    this.storageKey = storageKey;
    this.queue = [];

    this._enqueue(async () => {
      const raw = await SecureStore.getItemAsync(this.storageKey);
      if (raw) {
        const decoded = JSON.parse(raw);
        this.save(decoded.token, decoded.model);
      }
    });
  }

  save(token: string, model: any) {
    super.save(token, model);

    this._enqueue(() => {
      return SecureStore.setItemAsync(this.storageKey, JSON.stringify({ token, model }));
    });
  }

  clear() {
    super.clear();

    this._enqueue(() => {
      return SecureStore.deleteItemAsync(this.storageKey);
    });
  }

  _enqueue(asyncCallback: () => Promise<any>) {
    this.queue.push(asyncCallback);

    if (this.queue.length === 1) {
      this._dequeue();
    }
  }

  _dequeue() {
    if (!this.queue.length) {
      return;
    }

    this.queue[0]().finally(() => {
      this.queue.shift();

      if (!this.queue.length) {
        return;
      }

      this._dequeue();
    });
  }
}

export const pb = new PocketBase(process.env.EXPO_PUBLIC_BACKEND_URL, new AsyncAuthStore(), "de");

pb.autoCancellation(false);
