/**
 * Property CRUD operations with Prisma
 */

import prisma from "./prisma";
import { Property as PrismaProperty } from "@prisma/client";
import { Property, PropertyInput, PropertyOutput } from "@/types";

/**
 * Convert Prisma property to app Property type
 */
function toPrismaProperty(prismaProperty: PrismaProperty): Property {
  return {
    id: prismaProperty.id,
    name: prismaProperty.name,
    address: prismaProperty.address || undefined,
    postalCode: prismaProperty.postalCode || undefined,
    createdAt: prismaProperty.createdAt,
    updatedAt: prismaProperty.updatedAt,
    input: prismaProperty.inputData as PropertyInput,
    output: prismaProperty.outputData as PropertyOutput | undefined,
  };
}

/**
 * Create a new property for a user
 */
export async function createProperty(userId: string, data: Property): Promise<Property> {
  const prismaProperty = await prisma.property.create({
    data: {
      id: data.id,
      userId,
      name: data.name,
      address: data.address,
      postalCode: data.postalCode,
      inputData: data.input,
      outputData: data.output || null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    },
  });

  return toPrismaProperty(prismaProperty);
}

/**
 * Get all properties for a user
 */
export async function getPropertiesByUserId(userId: string): Promise<Property[]> {
  const properties = await prisma.property.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return properties.map(toPrismaProperty);
}

/**
 * Get a single property by ID (with ownership check)
 */
export async function getPropertyById(id: string, userId: string): Promise<Property | null> {
  const property = await prisma.property.findFirst({
    where: {
      id,
      userId,
    },
  });

  return property ? toPrismaProperty(property) : null;
}

/**
 * Update a property
 */
export async function updateProperty(
  id: string,
  userId: string,
  data: Partial<Property>
): Promise<Property> {
  const property = await prisma.property.update({
    where: {
      id,
      userId,
    },
    data: {
      name: data.name,
      address: data.address,
      postalCode: data.postalCode,
      inputData: data.input ? (data.input as object) : undefined,
      outputData: data.output ? (data.output as object) : undefined,
      updatedAt: new Date(),
    },
  });

  return toPrismaProperty(property);
}

/**
 * Delete a property
 */
export async function deleteProperty(id: string, userId: string): Promise<void> {
  await prisma.property.delete({
    where: {
      id,
      userId,
    },
  });
}
