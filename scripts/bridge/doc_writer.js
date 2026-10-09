// Descriptor-driven document writer. App-agnostic: the layer knows "header + lines + doc-action", never what a header IS.
// A descriptor (JSON, owned by the app) maps payload → ADInterface composite operations (ONE server transaction).
//   { composite:'<registered composite WS type>',
//     header:{ serviceType, table, fields:{COL:{const:v}|{path:'a.b'}} },
//     lines:{ serviceType, table, parent:'<ParentColumn>', from:'<payload array path>', lineNo:{col:'Line',step:10}, fields:{...} },
//     docAction:{ serviceType, table, action:'CO' },
//     expect:{ table, serviceType, cols:{COL:{const:v}|{path}} }   // read-back check (optional)
//   }
'use strict';
const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
const val = (spec, payload, ctx) => {
  if ('const' in spec) return spec.const;
  if ('path' in spec) { const v = get(ctx || payload, spec.path); if (v === undefined) throw new Error(`§DW payload missing '${spec.path}'`); return v; }
  throw new Error('§DW field spec needs const|path');
};
const F = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: v })) });

function validate(d) {
  for (const k of ['composite', 'header', 'docAction']) if (!d[k]) throw new Error(`§DW descriptor missing '${k}'`);
  if (d.lines && !(d.lines.parent && d.lines.from && d.lines.serviceType)) throw new Error('§DW lines needs serviceType,parent,from');
  return d;
}

function build(d, payload) {
  validate(d);
  const h = d.header, ops = [];
  const hrow = {}; for (const [c, s] of Object.entries(h.fields)) hrow[c] = val(s, payload);
  ops.push({ TargetPort: 'createData', ModelCRUD: { serviceType: h.serviceType, DataRow: F(hrow) } });
  let n = 0;
  if (d.lines) {
    const arr = get(payload, d.lines.from);
    if (!Array.isArray(arr) || !arr.length) throw new Error(`§DW payload '${d.lines.from}' must be a non-empty array`);
    for (const line of arr) {
      const row = {}; for (const [c, s] of Object.entries(d.lines.fields)) row[c] = val(s, payload, line);
      row[d.lines.parent] = `@${h.table}.${h.table}_ID`;                 // resolved server-side inside the same transaction
      if (d.lines.lineNo) row[d.lines.lineNo.col] = (++n) * d.lines.lineNo.step;
      ops.push({ TargetPort: 'createData', ModelCRUD: { serviceType: d.lines.serviceType, DataRow: F(row) } });
    }
  }
  const a = d.docAction;
  ops.push({ TargetPort: 'setDocAction', ModelSetDocAction: { serviceType: a.serviceType, tableName: a.table,
    recordIDVariable: `@${h.table}.${h.table}_ID`, docAction: a.action } });
  return { serviceType: d.composite, operations: ops, nLines: n };
}
module.exports = { build, validate };
