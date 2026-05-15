const major = parseInt(process.version.slice(1), 10);
if (Number.isNaN(major) || major >= 23) {
  console.error(
    `\nNode ${process.version} is not supported for Next.js dev in this repo (use Node 20 or 22 — see .nvmrc).\n`,
  );
  process.exit(1);
}
