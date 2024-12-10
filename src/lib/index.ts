import { access, defaultPluginOptions, type Plugin, type PluginOptions } from '@neokit-dev/core';
import { defaultNamespace as rns, id as rid, RelationalPlugin } from '@neokit-dev/relational';
import type { D1Database } from '@cloudflare/workers-types';

export const id = 'dev.neokit.d1';
export const defaultNamespace = `${rns}-d1`;
export const apiVersion = 2;
export const version = 1;
export const requires = {
	[rid]: [1, 1]
};

export class D1Plugin extends RelationalPlugin {
	db;

	constructor(options: D1PluginOptions) {
		super({ queryFn: async (s: string) => ([{ s }]), ...options });
		this.db = options.db;
	}

	async query(q: string, ...p: unknown[]): Promise<Record<string, unknown>[]> {
		return (await this.db.prepare(q).bind(...p).run()).results;
	}
}

export interface D1PluginOptions extends PluginOptions {
	db: D1Database;
	stringifyObjects?: boolean;
	timezone?: string;
}

export function plugin(options: D1PluginOptions): Plugin {
	return {
		id,
		version,
		apiVersion,
		plugin: new D1Plugin(options),
		...defaultPluginOptions(options, { namespace: defaultNamespace })
	};
}

export function query(q: string, ...p: unknown[]): Promise<Record<string, unknown>[]> {
	return namespace(defaultNamespace).query(q, ...p);
}

export function namespace(namespace: string): D1Plugin {
  return access(id)[namespace].plugin as D1Plugin;
}