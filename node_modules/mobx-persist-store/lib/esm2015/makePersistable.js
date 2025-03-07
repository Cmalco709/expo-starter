import { PersistStore } from './PersistStore';
import { PersistStoreMap } from './PersistStoreMap';
import { duplicatedStoreWarningIf } from './utils';
export const makePersistable = async (target, storageOptions, reactionOptions) => {
    const mobxPersistStore = new PersistStore(target, storageOptions, reactionOptions);
    const hasPersistedStoreAlready = Array.from(PersistStoreMap.values())
        .map((item) => item.storageName)
        .includes(mobxPersistStore.storageName);
    duplicatedStoreWarningIf(hasPersistedStoreAlready, mobxPersistStore.storageName);
    PersistStoreMap.set(target, mobxPersistStore);
    return mobxPersistStore.init();
};
