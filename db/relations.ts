import { relations } from "drizzle-orm";
import {
  categories,
  products,
  requests,
  requestNotes,
  conversations,
  messages,
  users,
} from "./schema";

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  product: one(products, {
    fields: [requests.productId],
    references: [products.id],
  }),
  notes: many(requestNotes),
  conversation: one(conversations, {
    fields: [requests.id],
    references: [conversations.requestId],
  }),
}));

export const requestNotesRelations = relations(requestNotes, ({ one }) => ({
  request: one(requests, {
    fields: [requestNotes.requestId],
    references: [requests.id],
  }),
  author: one(users, {
    fields: [requestNotes.authorId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
