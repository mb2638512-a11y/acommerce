import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getCategories = async (req: Request, res: Response) => {
 try {
  const categories = await prisma.category.findMany({
   orderBy: { order: 'asc' },
   include: {
    _count: {
     select: { children: true }
    }
   }
  });

  // In a real app, you'd calculate productCount across all stores for this category
  // For now, we'll return a mock productCount or leave it for the frontend to handle
  res.json(categories.map(c => ({
   ...c,
   productCount: Math.floor(Math.random() * 100) // Mock for now
  })));
 } catch (error) {
  res.status(500).json({ error: 'Failed to fetch categories' });
 }
};

export const createCategory = async (req: Request, res: Response) => {
 try {
  const { name, slug, description, parentId, order } = req.body;

  if (!name || !slug) {
   return res.status(400).json({ error: 'Name and slug are required' });
  }

  const category = await prisma.category.create({
   data: {
    name,
    slug,
    description,
    parentId,
    order: order || 0
   }
  });

  res.status(201).json(category);
 } catch (error) {
  res.status(500).json({ error: 'Failed to create category' });
 }
};

export const updateCategory = async (req: Request, res: Response) => {
 try {
  const { id } = req.params;
  const { name, slug, description, parentId, order } = req.body;

  const category = await prisma.category.update({
   where: { id },
   data: {
    name,
    slug,
    description,
    parentId,
    order
   }
  });

  res.json(category);
 } catch (error) {
  res.status(500).json({ error: 'Failed to update category' });
 }
};

export const deleteCategory = async (req: Request, res: Response) => {
 try {
  const { id } = req.params;

  // Check if it has children
  const childrenCount = await prisma.category.count({
   where: { parentId: id }
  });

  if (childrenCount > 0) {
   return res.status(400).json({ error: 'Cannot delete category with children' });
  }

  await prisma.category.delete({
   where: { id }
  });

  res.status(204).send();
 } catch (error) {
  res.status(500).json({ error: 'Failed to delete category' });
 }
};
