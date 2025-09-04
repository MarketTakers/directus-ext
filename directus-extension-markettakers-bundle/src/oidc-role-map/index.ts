import { createError } from '@directus/errors';

const NoRoleError = createError('FORBIDDEN', "You don't have any roles", 403);

async function fireHook(payload: any, userInfo: { [x: string]: any; }, services: { RolesService: new (arg0: { schema: any; }) => any; }, schemaFunctor: () => any) {
  const RolesService = new services.RolesService({
    schema: await schemaFunctor(),
  });

  for (const key of Object.keys(userInfo).filter((key) => key.startsWith("groups."))) {
	const providerGroupName = userInfo[key];
	if (providerGroupName != undefined) {
      const role = await RolesService.readByQuery(
        {
          filter: { name: { _eq: providerGroupName } },
        },
        {}
      );

      const roleId = role[0]?.id;

      if (roleId != null) {
        const ret = { ...payload, role: roleId };

        console.log("Returning role mapping:", ret);
        return ret;
      }
    }
  }

  throw new NoRoleError();

}

export default ({ filter }: any, { services, getSchema }: any) => {
  filter("auth.update", async (payload: any, { providerPayload }: any, _: any) => {
    return await fireHook(
      payload,
      providerPayload.userInfo,
      services,
      getSchema
    );
  });

  filter("auth.create", async (payload: any, meta: { providerPayload: { userInfo: { [x: string]: any; }; }; }, context: any) => {
    console.log("firing create: ", [payload, meta, context]);
    console.log("Provider payload: ", meta.providerPayload.userInfo);
    return await fireHook(
      payload,
      meta.providerPayload.userInfo,
      services,
      getSchema
    );
  });
};
