import { ApiExtensionContext } from '@directus/extensions';



type Services = {
  ActivityService: any;
  CollectionsService: any;
  FilesService: any;
  ItemsService: any;
  RelationsService: any;
  RolesService: any;
  ServerService: any;
  UsersService: any;
  WebhooksService: any;
};

export type ApiContext = {
  services: Services; // https://docs.directus.io/extensions/hooks.html
} & Omit<ApiExtensionContext, 'services'>;
