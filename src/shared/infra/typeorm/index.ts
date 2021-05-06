import { createConnection, getConnectionOptions, Connection } from 'typeorm';

export default async (name = 'default'): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOptions, {
      name,
      database:
        process.env.NODE_ENV === 'test'
          ? 'gostack_desafio09_tests'
          : defaultOptions.database,
    }),
  );
};

/**
 * Migrations
 * yarn typeorm migration:create -n CreateAppointments
 * yarn typeorm migration:run
 * yarn typeorm migration:revert
 * yarn typeorm migration:show
 */
