const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Helper to read YAML file
function readYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch(e) {
    return null;
  }
}

const collectionDir = path.join('postman', 'collections', 'LabODC API Testing');
const defFile = path.join(collectionDir, '.resources', 'definition.yaml');
const def = readYaml(defFile) || {};

// Build auth object for collection
function buildAuth(authDef) {
  if (!authDef) return undefined;
  const authArr = Array.isArray(authDef) ? authDef : [authDef];
  const a = authArr[0];
  if (!a) return undefined;
  const type = a.type || 'noauth';
  const result = { type };
  if (type === 'bearer' && a.credentials) {
    if (Array.isArray(a.credentials)) {
      result.bearer = a.credentials.map(c => ({key: c.key, value: c.value, type: 'string'}));
    } else {
      result.bearer = [{key: 'token', value: a.credentials.token || '', type: 'string'}];
    }
  }
  return result;
}

// Build request item from yaml
function buildRequest(reqYaml, filePath) {
  const name = reqYaml.name || path.basename(filePath, '.request.yaml');
  const method = (reqYaml.method || 'GET').toUpperCase();
  const url = reqYaml.url || '';

  const urlObj = { raw: url, host: [], path: [] };

  const headers = (reqYaml.headers || []).map(h => ({
    key: h.key,
    value: h.value,
    description: h.description || '',
    disabled: h.disabled || false
  }));

  const rawQueryParams = reqYaml.queryParams;
  const queryParamsArr = Array.isArray(rawQueryParams) ? rawQueryParams : (rawQueryParams ? Object.entries(rawQueryParams).map(([k,v]) => ({key:k, value:String(v)})) : []);
  const queryParams = queryParamsArr.map(q => ({
    key: q.key,
    value: q.value,
    description: q.description || '',
    disabled: q.disabled || false
  }));

  if (queryParams.length > 0) {
    urlObj.query = queryParams;
  }

  let body = undefined;
  if (reqYaml.body && reqYaml.body.type && reqYaml.body.type !== 'none') {
    const btype = reqYaml.body.type;
    if (btype === 'json') {
      body = { mode: 'raw', raw: reqYaml.body.content || '', options: { raw: { language: 'json' } } };
    } else if (btype === 'formdata') {
      body = { mode: 'formdata', formdata: (reqYaml.body.content || []).map(f => ({key: f.key, value: f.value || '', type: f.type || 'text', description: f.description || ''})) };
    } else if (btype === 'urlencoded') {
      body = { mode: 'urlencoded', urlencoded: (reqYaml.body.content || []).map(f => ({key: f.key, value: f.value || '', description: f.description || ''})) };
    } else {
      body = { mode: 'raw', raw: reqYaml.body.content || '' };
    }
  }

  let auth = undefined;
  if (reqYaml.auth) {
    auth = buildAuth(reqYaml.auth);
  }

  const events = [];
  if (reqYaml.scripts) {
    for (const s of reqYaml.scripts) {
      if (s.type === 'beforeRequest') {
        events.push({ listen: 'prerequest', script: { type: 'text/javascript', exec: s.code.split('\n') } });
      } else if (s.type === 'afterResponse') {
        events.push({ listen: 'test', script: { type: 'text/javascript', exec: s.code.split('\n') } });
      }
    }
  }

  const item = {
    name,
    request: {
      method,
      header: headers,
      url: urlObj
    },
    response: []
  };

  if (body) item.request.body = body;
  if (auth) item.request.auth = auth;
  if (events.length > 0) item.event = events;

  return item;
}

// Process a folder directory
function processFolder(dirPath) {
  const items = [];
  const entries = fs.readdirSync(dirPath).sort();

  for (const entry of entries) {
    if (entry === '.resources') continue;
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const subItems = processFolder(fullPath);
      items.push({ name: entry, item: subItems });
    } else if (entry.endsWith('.request.yaml')) {
      const reqYaml = readYaml(fullPath);
      if (reqYaml) {
        items.push(buildRequest(reqYaml, fullPath));
      }
    }
  }
  return items;
}

const collectionItems = processFolder(collectionDir);

const collection = {
  info: {
    _postman_id: 'ae2f66b4-e3e4-420b-9ae2-44f2fbe3386e',
    name: 'LabODC API Testing',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: collectionItems
};

if (def.auth) {
  collection.auth = buildAuth(def.auth);
}

if (def.variables && def.variables.length > 0) {
  collection.variable = def.variables.map(v => ({key: v.key, value: v.value || '', type: 'string'}));
}

const outDir = path.join('testing', 'postman');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'LabODC.postman_collection.json');
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('SUCCESS: Written to ' + outPath);
console.log('Folders/items at root: ' + collectionItems.length);
