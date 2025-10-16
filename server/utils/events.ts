import redis from './redis';
import prisma from './prisma';

export interface CategoryCreatedEvent {
  categoryId: number;
  parentId: number | null;
}

export interface CategoryUpdatedEvent {
  categoryId: number;
  oldParentId: number | null;
  newParentId: number | null;
}

export interface CategoryDeletedEvent {
  categoryId: number;
  parentId: number | null;
}

export interface ProductCreatedEvent {
  productId: number;
  categoryId: number;
}

export interface ProductUpdatedEvent {
  productId: number;
  oldCategoryId: number;
  newCategoryId: number;
}

export interface ProductDeletedEvent {
  productId: number;
  categoryId: number;
}

export async function emitCategoryCreated(event: CategoryCreatedEvent) {
  await invalidateCategoryCache(event.categoryId);
  
  if (event.parentId) {
    await invalidateCategoryAndAncestors(event.parentId);
  }
}

export async function emitCategoryUpdated(event: CategoryUpdatedEvent) {
  await invalidateCategoryAndAncestors(event.categoryId);
  
  if (event.oldParentId && event.oldParentId !== event.newParentId) {
    await invalidateCategoryAndAncestors(event.oldParentId);
  }
  
  if (event.newParentId && event.oldParentId !== event.newParentId) {
    await invalidateCategoryAndAncestors(event.newParentId);
  }
}

export async function emitCategoryDeleted(event: CategoryDeletedEvent) {
  if (event.parentId) {
    await invalidateCategoryAndAncestors(event.parentId);
  }
  
  await deleteCachePattern('categories:list:*');
}

export async function emitProductCreated(event: ProductCreatedEvent) {
  await invalidateCategoryAndAncestors(event.categoryId);
}

export async function emitProductUpdated(event: ProductUpdatedEvent) {
  await invalidateCategoryAndAncestors(event.oldCategoryId);
  
  if (event.newCategoryId !== event.oldCategoryId) {
    await invalidateCategoryAndAncestors(event.newCategoryId);
  }
}

export async function emitProductDeleted(event: ProductDeletedEvent) {
  await invalidateCategoryAndAncestors(event.categoryId);
}

function getCategoryCountCacheKey(categoryId: number): string {
  return `category:${categoryId}:recursive-product-count`;
}

async function invalidateCategoryCache(categoryId: number): Promise<void> {
  const cacheKey = getCategoryCountCacheKey(categoryId);
  await redis.del(cacheKey);
}

async function invalidateCategoryAndAncestors(categoryId: number): Promise<void> {
  await invalidateCategoryCache(categoryId);
  
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { parentId: true },
  });
  
  if (category?.parentId) {
    await invalidateCategoryAndAncestors(category.parentId);
  }
}

async function deleteCachePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
