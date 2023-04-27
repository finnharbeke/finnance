import { RecordQueryResult } from "./Record";
import { UserQueryResult } from "./User";

export interface CategoryQueryResult {
    id: number,
    desc: string,
    is_expense: boolean,
    usable: boolean,
    parent_id: number | null,
    color: string,
    order: number,
    user_id: number,
    parent: CategoryQueryResult,
    type: 'category'
}
export interface CategoryDeepQueryResult extends CategoryQueryResult {
    user: UserQueryResult, 
    records: RecordQueryResult[], 
    children: CategoryQueryResult[], 
}