import { z } from "zod";

export const DISPLAY_TIMEZONE = "Africa/Tripoli";

export const RegionSchema = z.enum(["west", "east", "south", "national", "unspecified"]);
export type Region = z.infer<typeof RegionSchema>;

export const SectorSchema = z.enum(["oil-gas", "un-humanitarian", "telecom", "logistics", "other"]);
export type Sector = z.infer<typeof SectorSchema>;

export const CategorySchema = z.enum([
  "politics",
  "oil",
  "security",
  "infrastructure",
  "economy",
  "humanitarian",
  "diplomacy",
]);
export type Category = z.infer<typeof CategorySchema>;

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const VerificationStatusSchema = z.enum([
  "unverified",
  "reported",
  "corroborated",
  "disputed",
  "corrected",
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const EditorialStatusSchema = z.enum(["draft", "review", "published", "withdrawn"]);
export type EditorialStatus = z.infer<typeof EditorialStatusSchema>;

export const SeveritySchema = z.enum(["low", "moderate", "high"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const DirectionSchema = z.enum(["improving", "deteriorating", "mixed", "unchanged", "unknown"]);
export type Direction = z.infer<typeof DirectionSchema>;

export const SourceTypeSchema = z.enum([
  "official",
  "un",
  "operator",
  "media",
  "ngo",
  "market",
  "other",
]);

export const ReviewStatusSchema = z.enum(["unreviewed", "reviewed", "rejected"]);

export const CollectionMethodSchema = z.enum(["rss", "public-api", "manual", "none"]);

export const IsoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Must be an ISO-8601 timestamp");

export const HttpUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }, "Only http and https URLs are allowed");

export const CorrectionSchema = z.object({
  correctedAt: IsoDateTimeSchema,
  summary: z.string().min(1).max(400),
});

export const DisputedClaimSchema = z.object({
  claim: z.string().min(1).max(500),
  attributedTo: z.string().min(1).max(200),
  note: z.string().min(1).max(400),
});

export const SourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: HttpUrlSchema,
  language: z.string().min(2).max(16),
  sourceType: SourceTypeSchema,
  geographicCoverage: z.array(z.string().min(1)).min(1),
  collectionMethod: CollectionMethodSchema,
  reviewStatus: ReviewStatusSchema,
  reuseNotes: z.string().min(1),
  enabled: z.boolean(),
  adapter: z.string().optional(),
  endpoint: z.string().optional(),
  termsNotes: z.string().optional(),
  robotsCheckedAt: IsoDateTimeSchema.optional(),
  localeReady: z.array(z.string()).default(["en"]),
});
export type Source = z.infer<typeof SourceSchema>;

export const ArticleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(220),
  summary: z.string().min(1).max(600),
  whatHappened: z.string().min(1),
  whyItMatters: z.string().min(1),
  watchNext: z.string().min(1),
  region: RegionSchema,
  locations: z.array(z.string().min(1)).min(1),
  categories: z.array(CategorySchema).min(1),
  sectors: z.array(SectorSchema).min(1),
  eventTime: IsoDateTimeSchema.nullable(),
  sourcePublishedAt: IsoDateTimeSchema.nullable(),
  publishedAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
  sourceIds: z.array(z.string().min(1)).min(1),
  sourceUrls: z.array(HttpUrlSchema),
  verificationStatus: VerificationStatusSchema,
  confidence: ConfidenceSchema,
  confidenceRationale: z.string().min(1).max(400),
  editorialStatus: EditorialStatusSchema,
  demo: z.boolean(),
  severity: SeveritySchema,
  direction: DirectionSchema,
  disputedClaims: z.array(DisputedClaimSchema).default([]),
  corrections: z.array(CorrectionSchema).default([]),
  locale: z.string().default("en"),
});
export type Article = z.infer<typeof ArticleSchema>;

export const BuySellSchema = z.enum(["buy", "sell", "mid", "unspecified"]);
export const CashTransferSchema = z.enum(["cash", "transfer", "unspecified"]);

export const IndicatorTypeSchema = z.enum([
  "fx-official",
  "fx-parallel",
  "electricity",
  "water",
  "internet",
  "oil-production",
  "oil-terminal",
  "brent",
  "libyan-crude",
]);
export type IndicatorType = z.infer<typeof IndicatorTypeSchema>;

export const InfraStatusSchema = z.enum(["reported", "confirmed", "resolved", "unknown"]);
export type InfraStatus = z.infer<typeof InfraStatusSchema>;

export const IndicatorObservationSchema = z.object({
  id: z.string().min(1),
  indicatorType: IndicatorTypeSchema,
  value: z.number().finite().nullable(),
  unit: z.string().min(1),
  currencyPair: z.string().nullable(),
  location: z.string().min(1),
  buySell: BuySellSchema.nullable(),
  cashTransfer: CashTransferSchema.nullable(),
  observedAt: IsoDateTimeSchema.nullable(),
  collectedAt: IsoDateTimeSchema,
  sourceId: z.string().min(1),
  verificationStatus: VerificationStatusSchema,
  demo: z.boolean(),
  editorialStatus: EditorialStatusSchema,
  infraStatus: InfraStatusSchema.nullable(),
  restorationUpdate: z.string().nullable(),
  notes: z.string().nullable(),
});
export type IndicatorObservation = z.infer<typeof IndicatorObservationSchema>;

export const DailyBriefingSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().min(1).max(1200),
  essentialArticleIds: z.array(z.string().min(1)).max(5),
  watchNext: z.array(z.string().min(1)).min(1).max(8),
  editorialStatus: EditorialStatusSchema,
  demo: z.boolean(),
  publishedAt: IsoDateTimeSchema,
  locale: z.string().default("en"),
});
export type DailyBriefing = z.infer<typeof DailyBriefingSchema>;

export const ScheduledEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  text: z.string().min(1).max(300),
});

export const WeeklyOutlookSchema = z.object({
  id: z.string().min(1),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mainChanges: z.array(z.string().min(1)).min(1),
  scheduledEvents: z.array(ScheduledEventSchema),
  monitorQuestions: z.array(z.string().min(1)).min(1),
  editorialStatus: EditorialStatusSchema,
  demo: z.boolean(),
  publishedAt: IsoDateTimeSchema,
  locale: z.string().default("en"),
});
export type WeeklyOutlook = z.infer<typeof WeeklyOutlookSchema>;

export const SettingsSchema = z.object({
  siteName: z.string().min(1),
  tagline: z.string().min(1),
  timezone: z.literal(DISPLAY_TIMEZONE),
  showDemoContent: z.boolean(),
  contactHref: z.string(),
  siteUrl: z.string().min(1),
  lastReviewedAt: IsoDateTimeSchema,
  fxAlignmentHours: z.number().int().positive().default(48),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DraftRecordSchema = z.object({
  id: z.string().min(1),
  adapter: z.string().min(1),
  sourceId: z.string().min(1),
  canonicalUrl: HttpUrlSchema,
  title: z.string().min(1),
  excerpt: z.string(),
  sourcePublishedAt: IsoDateTimeSchema.nullable(),
  collectedAt: IsoDateTimeSchema,
  contentHash: z.string().min(1),
  editorialStatus: z.literal("draft"),
  demo: z.literal(false),
  language: z.string().optional(),
});
export type DraftRecord = z.infer<typeof DraftRecordSchema>;
