/**
 * Canonical manuscript data model for UNBOUND.
 *
 * Design rules:
 * - Content is semantic only (no formatting or layout).
 * - IDs are stable and opaque strings.
 * - Ordering is represented explicitly via arrays and `order` numbers.
 * - Metadata is lightweight and optional.
 * - Model favors readability and future extensibility.
 */

export type UUID = string;

export interface Metadata {
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  notes?: string;
  [key: string]: unknown; // extensibility
}

export type SectionKind = "frontMatter" | "body" | "backMatter";

export interface Project {
  id: UUID;
  title?: string;
  author?: string;
  metadata?: Metadata;
  sections: Section[]; // ordered
}

export interface Section {
  id: UUID;
  kind: SectionKind;
  title?: string;
  order: number;
  metadata?: Metadata;
  chapters: Chapter[]; // ordered
}

export interface Chapter {
  id: UUID;
  title?: string; // semantic heading without decoration
  number?: number; // numeric chapter index when applicable
  order: number;
  metadata?: Metadata;
  scenes?: Scene[]; // optional & ordered
  paragraphs?: Paragraph[]; // used when scenes are not identified
}

export interface Scene {
  id: UUID;
  label?: string; // optional semantic label
  order: number;
  metadata?: Metadata;
  paragraphs: Paragraph[]; // ordered
}

export interface Paragraph {
  id: UUID;
  order: number;
  content: string; // plain text, semantic only
  metadata?: Metadata;
}

/** Utility: generate a simple opaque ID. */
export function makeId(prefix: string = "id"): UUID {
  // Using a time + random based ID for local-first stability without dependencies.
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rnd}`;
}
