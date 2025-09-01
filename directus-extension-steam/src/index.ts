import { createError } from "@directus/errors";
import { EndpointExtensionContext } from "@directus/types";
import { Router } from "express";
import { UUID } from "crypto";
import { Readable } from "stream";

import * as SteamTotp from "steam-totp";

const collSteamAccount = "Steam_Account";

interface Account {
  sda_file: UUID;
}

async function readStreamFully(stream: Readable): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function get_code_from_username(
  username: string,
  context: EndpointExtensionContext
): Promise<string> {
  const steamAccounts = new context.services.ItemsService(collSteamAccount, {
    knex: context.database,
    accountability: null,
    schema: await context.getSchema({ database: context.database }),
  });

  const account = (await steamAccounts.readOne(username)) as Account;
  if (!account) {
    throw createError("NOT_FOUND", "Account not found");
  }

  const assetsService = new context.services.AssetsService({
    knex: context.database,
    accountability: null,
    schema: await context.getSchema({ database: context.database }),
  });

  const sda_file_entry = await assetsService.getAsset(account.sda_file);
  const sda_file_contents_bytes = await readStreamFully(sda_file_entry.stream);
  const sda_file_contents = sda_file_contents_bytes.toString("utf-8");
  const sda_file = JSON.parse(sda_file_contents);

  return SteamTotp.generateAuthCode(sda_file.shared_secret);
}

async function handle_code_request(
  context: EndpointExtensionContext,
  req: any,
  res: any
) {
  var username = req.query["username"];
  const code = await get_code_from_username(username, context);

  res.send({ code });
}

async function handle_batch_codes_request(
  context: EndpointExtensionContext,
  req: any,
  res: any
) {
  const usernames = req.query["username"];
  if (!Array.isArray(usernames)) {
    return res.status(400).send({ error: "Invalid request" });
  }

  const codes = await Promise.all(
    usernames.map((username) => get_code_from_username(username, context).then((code) => {
      return { [username]: code };
    }))
  );

  res.send({ codes });
}

export default {
  id: "steam",
  handler: (router: Router, context: any) => {
    router.get("/code", (req: any, res: any) =>
      handle_code_request(context, req, res)
    );

    router.get("/code/batch", (req: any, res: any) =>
      handle_batch_codes_request(context, req, res)
    ); 
  },
};
