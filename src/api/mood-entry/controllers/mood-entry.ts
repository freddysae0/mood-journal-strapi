import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::mood-entry.mood-entry",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { id } = ctx.params;

      const entity = await strapi.entityService.findOne(
        "api::mood-entry.mood-entry",
        id,
        {
          populate: "*", // Puedes ajustar los campos si no necesitas todo
        }
      );

      return this.transformResponse(entity);
    },
    // PUT /api/mood-entries/:id
    async update(ctx) {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to update a mood entry");
      }

      // Trae la entrada para verificar que exista y que sea del usuario
      const existingEntry = await strapi.entityService.findOne(
        "api::mood-entry.mood-entry",
        id,
        {
          populate: { user: true },
        }
      );

      if (!existingEntry) {
        return ctx.notFound("Mood entry not found");
      }

      // Si no es el dueño ni admin, no tiene permiso
      // @ts-ignore
      const isOwner = existingEntry.user?.id === user.id;
      if (!isOwner) {
        return ctx.unauthorized(
          "You don't have permission to update this entry"
        );
      }

      // Procede con la actualización
      const updatedEntry = await strapi.entityService.update(
        "api::mood-entry.mood-entry",
        id,
        {
          data,
          populate: "*",
        }
      );

      return this.transformResponse(updatedEntry);
    },
    // POST /api/mood-entries
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to create a mood entry");
      }

      const { data } = ctx.request.body;

      const newEntry = await strapi.entityService.create(
        "api::mood-entry.mood-entry",
        {
          data: {
            ...data,
            user: user.id, // 👈 Aquí se asigna el user
          },
        }
      );

      return this.transformResponse(newEntry);
    },
  })
);
