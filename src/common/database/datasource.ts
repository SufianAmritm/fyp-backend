import { DataSource, DataSourceOptions } from 'typeorm';
import Config from './config';

const dataSource = new DataSource(Config.database as DataSourceOptions);

export default dataSource;
