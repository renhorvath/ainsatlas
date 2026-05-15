/**
 * After `next build` in web/, copy outputs Vercel expects at the repo root
 * when the Vercel project Root Directory is the Git root (not web/).
 */
import fs from "fs";
import path from "path";

const root = process.cwd();
const web = path.join(root, "web");

function mustExist(p) {
  if (!fs.existsSync(p)) {
    throw new Error(`vercel-sync-build: missing ${p}`);
  }
}

mustExist(path.join(web, ".next"));
mustExist(path.join(web, "conferences.json"));
mustExist(path.join(web, "public"));

const nextDest = path.join(root, ".next");
fs.rmSync(nextDest, { recursive: true, force: true });
fs.cpSync(path.join(web, ".next"), nextDest, { recursive: true });

fs.copyFileSync(
  path.join(web, "conferences.json"),
  path.join(root, "conferences.json"),
);

const publicDest = path.join(root, "public");
fs.rmSync(publicDest, { recursive: true, force: true });
fs.cpSync(path.join(web, "public"), publicDest, { recursive: true });

console.log("vercel-sync-build: synced .next, conferences.json, public/ to repo root");
