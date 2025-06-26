import fs from 'fs/promises';
import path from 'path';
import {db} from '../src/db.js';

export default async function setup(){
    await fs.rm(path.join(process.cwd(),'db.sqlite'))
}