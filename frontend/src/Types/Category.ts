import { RecordFlat } from "./Record";
import { UserFlat } from "./User";

export interface CategoryFlat {
    id: number,
    desc: string,
    is_expense: boolean,
    usable: boolean,
    parent_id: number,
    color: string,
    order: number,
    user_id: number,
    parent: CategoryFlat, 
}
export interface CategoryDeep {
    id: number,
    desc: string,
    is_expense: boolean,
    usable: boolean,
    parent_id: number,
    color: string,
    order: number,
    user_id: number,
    parent: CategoryFlat,
    user: UserFlat, 
    records: RecordFlat[], 
    children: CategoryFlat[], 
}