import { Injectable } from '@angular/core';
import { StorageArrayValue, StorageKey, StorageValue } from '../types/services/storage-provider';

@Injectable({
    providedIn: 'root'
})
export class StorageProviderService {
    #provider: Storage

    constructor() {
        this.#provider = window.localStorage // localStorage will keep data across tabs
    }

    has(key: StorageKey): boolean {
        const value = this.#provider.getItem(key)

        if(value === null)
            return false

        return false
    }

    get(key: StorageKey): StorageValue | StorageArrayValue {
        const value = this.#provider.getItem(key)

        if(value === null)
            return false

        return JSON.parse(value)
    }

    set(key: StorageKey, value: StorageValue | StorageArrayValue): void {
        this.#provider.setItem(key, JSON.stringify(value))
    }
}
