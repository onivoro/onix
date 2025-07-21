import { ExecutorContext, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { $html, $head, $title, $meta, $script, $style, $body, $div, $h1, $h3, $textarea, $button, $table, $thead, $tbody, $tr, $th, $td, $p, $em } from '@onivoro/server-html';
import { DataSource } from 'typeorm';
import { join, dirname } from 'path';
import * as express from 'express';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const {
    envFile = '/Users/leenorris/github.com/silvertek-us/silvertek/.env.colleran.collerancompanies.com',
    host = 'PG_HOST',
    database = 'PG_DB',
    password = 'PG_PASSWORD',
    port = 'PG_PORT',
    username = 'PG_USER',
    type = 'postgres'
  } = options || {};

  // Load environment file if provided
  if (envFile) {
    loadEnvFile(envFile);
  }

  // Extract database configuration from options or environment variables
  const dbConfig = {
    host: process.env[host],
    port: process.env[port],
    username: process.env[username],
    password: process.env[password],
    database: process.env[database],
    type: type as any,
    ssl: options?.ssl !== undefined ? options.ssl : (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1')
  };

  // Create TypeORM DataSource configuration
  const dataSourceConfig = {
    type: dbConfig.type,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: false, // Never auto-sync in production
    logging: process.env.DB_LOGGING === 'true',
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    // Empty entities array since we're doing raw queries for database introspection
    entities: [],
    // Set reasonable connection pool settings
    extra: {
      max: 10,
      min: 1,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    }
  };

  logger.info(`Creating DataSource with configuration:`);
  logger.info(`- Type: ${dataSourceConfig.type}`);
  logger.info(`- Host: ${dataSourceConfig.host}`);
  logger.info(`- Port: ${dataSourceConfig.port}`);
  logger.info(`- Database: ${dataSourceConfig.database}`);
  logger.info(`- Username: ${dataSourceConfig.username}`);
  logger.info(`- SSL: ${dataSourceConfig.ssl ? 'enabled' : 'disabled'}`);

  const dataSource = new DataSource(dataSourceConfig);

  try {
    await dataSource.initialize();
    logger.info('Database connection established');

    // Create Express server
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.get('/', (req, res) => {
      res.send(getDatabaseClientUI());
    });

    app.get('/api/tables', async (req, res) => {
      const tablesHtml = await getTables(dataSource);
      res.send(tablesHtml);
    });

    app.get('/api/table/:tableName', async (req, res) => {
      const tableDataHtml = await getTableData(dataSource, req.params.tableName);
      res.send(tableDataHtml);
    });

    app.get('/api/table/:tableName/structure', async (req, res) => {
      const structureHtml = await getTableStructure(dataSource, req.params.tableName);
      res.send(structureHtml);
    });

    app.post('/api/query', async (req, res) => {
      const queryResultHtml = await executeQuery(dataSource, req.body.query);
      res.send(queryResultHtml);
    });

    const server = app.listen(3000, () => {
      logger.info('Database client UI available at http://localhost:3000');
    });

    // Keep the process running indefinitely
    const keepRunning = new Promise<void>((resolve) => {
      process.on('SIGINT', async () => {
        logger.info('Shutting down database client...');
        server.close();
        await dataSource.destroy();
        resolve();
      });

      process.on('SIGTERM', async () => {
        logger.info('Shutting down database client...');
        server.close();
        await dataSource.destroy();
        resolve();
      });
    });

    // Wait indefinitely until process is terminated
    await keepRunning;

  } catch (error) {
    logger.error('Failed to connect to database: ' + error.message);
    throw error;
  }
});

function getDatabaseClientUI(): string {
  return $html({
    lang: 'en',
    children: [
      $head({
        children: [
          $meta({ charset: 'UTF-8' }),
          $meta({ name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
          $title({ textContent: 'TypeORM Database Client' }),
          $script({ src: 'https://unpkg.com/htmx.org@1.9.10' }),
          $script({ src: 'https://unpkg.com/alpinejs@3.13.5/dist/cdn.min.js', defer: true }),
          $style({
            textContent: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
              .container { display: flex; height: 100vh; }
              .sidebar { width: 300px; background: #fff; border-right: 1px solid #e0e0e0; overflow-y: auto; }
              .main { flex: 1; display: flex; flex-direction: column; }
              .header { background: #fff; padding: 1rem; border-bottom: 1px solid #e0e0e0; }
              .content { flex: 1; padding: 1rem; overflow: auto; }
              .table-list { padding: 1rem; }
              .table-item { padding: 0.5rem; cursor: pointer; border-radius: 4px; margin-bottom: 0.25rem; }
              .table-item:hover { background: #f0f0f0; }
              .table-item.active { background: #007acc; color: white; }
              .query-editor { margin-bottom: 1rem; }
              .query-editor textarea { width: 100%; height: 100px; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-family: monospace; }
              .btn { padding: 0.5rem 1rem; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; }
              .btn:hover { background: #005a9e; }
              .table-container { background: white; border-radius: 4px; overflow: hidden; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
              th { background: #f8f9fa; font-weight: 600; }
              .loading { text-align: center; padding: 2rem; color: #666; }
              .error { background: #fee; color: #c33; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
              .tabs { display: flex; border-bottom: 1px solid #e0e0e0; }
              .tab { padding: 0.75rem 1rem; cursor: pointer; border-bottom: 2px solid transparent; }
              .tab.active { border-bottom-color: #007acc; color: #007acc; font-weight: 600; }
              .tab-content { display: none; }
              .tab-content.active { display: block; }
            `
          })
        ]
      }),
      $body({
        'x-data': 'dbClient()',
        children: [
          $div({
            className: 'container',
            children: [
              // Sidebar
              $div({
                className: 'sidebar',
                children: [
                  $div({
                    className: 'table-list',
                    children: [
                      $h3({
                        textContent: 'Tables',
                        style: { marginBottom: '1rem', color: '#333' }
                      }),
                      $div({
                        'hx-get': '/api/tables',
                        'hx-trigger': 'load',
                        'hx-target': '#table-list',
                        children: [
                          $div({
                            id: 'table-list',
                            className: 'loading',
                            textContent: 'Loading tables...'
                          })
                        ]
                      })
                    ]
                  })
                ]
              }),
              // Main Content
              $div({
                className: 'main',
                children: [
                  $div({
                    className: 'header',
                    children: [
                      $h1({ textContent: 'TypeORM Database Client' })
                    ]
                  }),
                  $div({
                    className: 'content',
                    children: [
                      // Query Editor
                      $div({
                        className: 'query-editor',
                        children: [
                          $textarea({
                            'x-model': 'query',
                            placeholder: 'Enter SQL query...'
                          }),
                          $button({
                            className: 'btn',
                            '@click': 'executeQuery()',
                            style: { marginTop: '0.5rem' },
                            textContent: 'Execute Query'
                          })
                        ]
                      }),
                      // Results Area
                      $div({
                        id: 'results-area',
                        children: [
                          $div({
                            className: 'loading',
                            textContent: 'Select a table or execute a query to see results'
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          $script({
            textContent: `
              function dbClient() {
                  return {
                      query: '',
                      selectedTable: '',

                      selectTable(tableName) {
                          this.selectedTable = tableName;

                          // Update table list active state
                          document.querySelectorAll('.table-item').forEach(item => {
                              item.classList.remove('active');
                          });
                          event.target.classList.add('active');

                          // Load table data with tabs
                          htmx.ajax('GET', '/api/table/' + tableName, {
                              target: '#results-area'
                          });
                      },

                      executeQuery() {
                          if (!this.query.trim()) return;

                          htmx.ajax('POST', '/api/query', {
                              target: '#results-area',
                              values: { query: this.query }
                          });
                      },

                      switchTab(tabName) {
                          // Handle tab switching
                          document.querySelectorAll('.tab').forEach(tab => {
                              tab.classList.remove('active');
                          });
                          document.querySelectorAll('.tab-content').forEach(content => {
                              content.classList.remove('active');
                          });

                          event.target.classList.add('active');
                          document.getElementById(tabName + '-content').classList.add('active');

                          // Load structure if structure tab is clicked
                          if (tabName === 'structure' && this.selectedTable) {
                              htmx.ajax('GET', '/api/table/' + this.selectedTable + '/structure', {
                                  target: '#structure-content'
                              });
                          }
                      }
                  }
              }

              // Make selectTable and switchTab globally available for HTMX
              window.selectTable = function(tableName) {
                  document.querySelector('[x-data]').__x.$data.selectTable(tableName);
              };

              window.switchTab = function(tabName) {
                  document.querySelector('[x-data]').__x.$data.switchTab(tabName);
              };
            `
          })
        ]
      })
    ]
  });
}

async function getTables(dataSource: DataSource): Promise<string> {
  try {
    const tables = await dataSource.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tableElements = tables.map(table =>
      $div({
        className: 'table-item',
        onclick: `selectTable('${table.table_name}')`,
        textContent: table.table_name
      })
    );

    return tableElements.join('');
  } catch (error) {
    return $div({
      className: 'error',
      textContent: `Error loading tables: ${error.message}`
    });
  }
}

async function getTableData(dataSource: DataSource, tableName: string): Promise<string> {
  try {
    const data = await dataSource.query(`SELECT * FROM "${tableName}" LIMIT 100`);

    if (data.length === 0) {
      const tabs = $div({
        className: 'tabs',
        children: [
          $div({
            className: 'tab active',
            onclick: "switchTab('data')",
            textContent: 'Data'
          }),
          $div({
            className: 'tab',
            onclick: "switchTab('structure')",
            textContent: 'Structure'
          })
        ]
      });

      const dataContent = $div({
        id: 'data-content',
        className: 'tab-content active',
        children: [
          $p({
            style: { padding: '2rem', textAlign: 'center', color: '#666' },
            textContent: `No data found in table "${tableName}"`
          })
        ]
      });

      const structureContent = $div({
        id: 'structure-content',
        className: 'tab-content'
      });

      return tabs + dataContent + structureContent;
    }

    const columns = Object.keys(data[0]);
    const headerRow = $tr({
      children: columns.map(col => $th({ textContent: col }))
    });

    const rows = data.map(row =>
      $tr({
        children: columns.map(col =>
          $td({
            innerHTML: row[col] !== null ? String(row[col]) : '<em>NULL</em>'
          })
        )
      })
    );

    const tabs = $div({
      className: 'tabs',
      children: [
        $div({
          className: 'tab active',
          onclick: "switchTab('data')",
          textContent: 'Data'
        }),
        $div({
          className: 'tab',
          onclick: "switchTab('structure')",
          textContent: 'Structure'
        })
      ]
    });

    const dataContent = $div({
      id: 'data-content',
      className: 'tab-content active',
      children: [
        $div({
          className: 'table-container',
          children: [
            $table({
              children: [
                $thead({ children: [headerRow] }),
                $tbody({ children: rows })
              ]
            })
          ]
        })
      ]
    });

    const structureContent = $div({
      id: 'structure-content',
      className: 'tab-content'
    });

    return tabs + dataContent + structureContent;
  } catch (error) {
    return $div({
      className: 'error',
      textContent: `Error loading table data: ${error.message}`
    });
  }
}

async function getTableStructure(dataSource: DataSource, tableName: string): Promise<string> {
  try {
    const columns = await dataSource.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    const headerRow = $tr({
      children: [
        $th({ textContent: 'Column' }),
        $th({ textContent: 'Type' }),
        $th({ textContent: 'Nullable' }),
        $th({ textContent: 'Default' })
      ]
    });

    const rows = columns.map(col =>
      $tr({
        children: [
          $td({ textContent: col.column_name }),
          $td({ textContent: col.data_type }),
          $td({ textContent: col.is_nullable }),
          $td({
            innerHTML: col.column_default || '<em>NULL</em>'
          })
        ]
      })
    );

    return $div({
      className: 'table-container',
      children: [
        $table({
          children: [
            $thead({ children: [headerRow] }),
            $tbody({ children: rows })
          ]
        })
      ]
    });
  } catch (error) {
    return $div({
      className: 'error',
      textContent: `Error loading table structure: ${error.message}`
    });
  }
}

async function executeQuery(dataSource: DataSource, query: string): Promise<string> {
  try {
    const result = await dataSource.query(query);

    if (!Array.isArray(result) || result.length === 0) {
      return $div({
        style: { padding: '2rem', textAlign: 'center', color: '#666' },
        textContent: 'Query executed successfully. No results to display.'
      });
    }

    const columns = Object.keys(result[0]);
    const headerRow = $tr({
      children: columns.map(col => $th({ textContent: col }))
    });

    const rows = result.map(row =>
      $tr({
        children: columns.map(col =>
          $td({
            innerHTML: row[col] !== null ? String(row[col]) : '<em>NULL</em>'
          })
        )
      })
    );

    return $div({
      className: 'table-container',
      children: [
        $table({
          children: [
            $thead({ children: [headerRow] }),
            $tbody({ children: rows })
          ]
        })
      ]
    });
  } catch (error) {
    return $div({
      className: 'error',
      textContent: `Query error: ${error.message}`
    });
  }
}
