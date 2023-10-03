import PocketBase from "pocketbase";
import { AsyncAuthStore } from "./async-auth-store";

export const pb = new PocketBase("https://strackfit.timostrackfeldt.com/", new AsyncAuthStore(), "de");
// export const pb = new PocketBase("https://strackfit.fly.dev/", new AsyncAuthStore(), "de");

pb.autoCancellation(false);