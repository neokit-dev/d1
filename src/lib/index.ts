import { access, defaultPluginOptions, inject, type Plugin, type PluginOptions } from '@neokit-dev/core';
import { defaultNamespace as rns, id as rid, RelationalPlugin } from '@neokit-dev/relational';
import type { D1Database } from '@cloudflare/workers-types';

export const id = 'dev.neokit.d1';
export const defaultNamespace = `${rns}-d1`;
export const apiVersion = 3;
export const version = 2;
export const requires = {
	[rid]: [2, 2]
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
	relationalNamespace?: string;
	stringifyObjects?: boolean;
	timezone?: string;
}

export function plugin(options: D1PluginOptions): Plugin {
	const p = {
		id,
		version,
		apiVersion,
		plugin: new D1Plugin(options),
		requires,
		...defaultPluginOptions(options, { namespace: defaultNamespace }),
	};
	inject(rid, options.relationalNamespace || rns, p.plugin);
	return p;
}

export function query(q: string, ...p: unknown[]): Promise<Record<string, unknown>[]> {
	return namespace(rns).query(q, ...p);
}

export function namespace(namespace: string): D1Plugin {
  return access(rid)[namespace].plugin as D1Plugin;
}