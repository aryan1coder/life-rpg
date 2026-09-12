import { EquippedLoadout, ItemCategory, RewardItem } from './types';

/**
 * Validates that an item can be equipped into an active slot.
 */
export function canEquipItem(
  item: RewardItem,
  userLevel: number,
  ownedItemIds: Set<string>
): { canEquip: boolean; reason?: string } {
  if (!ownedItemIds.has(item.id)) {
    return { canEquip: false, reason: 'Item not owned in inventory.' };
  }
  if (userLevel < item.min_level_required) {
    return {
      canEquip: false,
      reason: `Requires operator Level ${item.min_level_required}. Current Level is ${userLevel}.`,
    };
  }
  return { canEquip: true };
}

/**
 * Updates loadout slot with equipped item.
 */
export function equipItemInLoadout(
  loadout: EquippedLoadout,
  item: RewardItem
): EquippedLoadout {
  const updated = { ...loadout };
  switch (item.category) {
    case 'Theme':
      updated.theme_id = item.id;
      break;
    case 'Cosmetic':
      updated.frame_id = item.id;
      break;
    case 'Title':
      updated.title_id = item.id;
      break;
    case 'Badge':
      updated.badge_id = item.id;
      break;
    case 'Boost':
      updated.boost_id = item.id;
      // 24 hours boost expiry default
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      updated.boost_expires_at = expiry.toISOString();
      break;
  }
  return updated;
}

/**
 * Unequips a specific slot in the loadout.
 */
export function unequipSlot(
  loadout: EquippedLoadout,
  category: ItemCategory
): EquippedLoadout {
  const updated = { ...loadout };
  switch (category) {
    case 'Theme':
      updated.theme_id = null;
      break;
    case 'Cosmetic':
      updated.frame_id = null;
      break;
    case 'Title':
      updated.title_id = null;
      break;
    case 'Badge':
      updated.badge_id = null;
      break;
    case 'Boost':
      updated.boost_id = null;
      updated.boost_expires_at = null;
      break;
  }
  return updated;
}
