import { accountScalars, agentScalars, categoryScalars, createSeedClient, currencyScalars, ModelCallbackContext, SeedClient, Store, transScalars, userScalars } from "@snaplet/seed";
import { copycat, Input } from "@snaplet/copycat";

// from https://github.com/umpirsky/currency-list/tree/master/data/en
import currencies from "./currencies.json"; // currencies except CHF
import categories from "./categories.json";
import account_descs from "./accounts.json";
import agent_descs from "./agents.json";
const hash123456 = "$2b$12$x7IUCloUV9o3tpuIYgiOXueUWr5GJ7FyrwIxgoeg317G/PBSulVjy";

const populate_db = async () => {
  const seed = await createSeedClient({
    // dryRun: true // un-comment to test and not over-write
  });

  // Truncate all tables in the database
  await seed.$resetDatabase();

  const nrRandomUsers = 1;

  // Seed the database with 10 user
  const { user } = await seed.user((x) => [
    {
      username: 'local',
      email: 'local@user.com',
      password: hash123456
    },
    ...x(nrRandomUsers, (ctx) => ({
      username: copycat.username(ctx.seed),
      email: copycat.email(ctx.seed),
      password: hash123456
    }))
  ]);

  for (const u of user) {
    const some_currs = copycat.someOf(u.id, [3, 10], currencies);
    const { currency } = await seed.currency((x) => [
      {
        code: "CHF",
        decimals: 2,
      },
      ...some_currs.map(code => ({
        code, decimals: 2
      }))
    ], { connect: { user: [u] } });
    
    const { category } = await populate_categories(seed, u);

    const { account } = await populate_accounts(seed, u, currency);

    
    const { agent } = await populate_agents(seed, u);
    
    // let's estimate 2 transfers a month, between 2-100 francs, so like roughly max 200 francs up or down from transfers
    await populate_transfers(seed, u, account);
    
    const { trans } = await populate_transactions(seed, u, account, agent);
    
    await populate_records(seed, trans, category);

  }

  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes

  console.log("Database seeded successfully!");

  process.exit();
};

const populate_categories = async (seed: SeedClient, u: userScalars) => {

    const some_exps = copycat.someOf(u.id, [10, 25], categories.expense);
    const parentless_exps = Math.trunc(some_exps.length * copycat.oneOf([0.9, 0.8, 0.7, 0.6, 0.5])(u.id));
    const some_incomes = copycat.someOf(u.id, [5, 10], categories.income);
    const parentless_incs = Math.trunc(some_incomes.length * copycat.oneOf([0.8, 0.6])(u.id));
    const { category: exp_parents } = await seed.category((x) => [
      ...x(parentless_exps, (ctx) => ({
        desc: some_exps.at(ctx.index),
        parent_id: null,
        color: '#'.concat(...Array(6).fill(0).map((_, ix) => copycat.hex(ctx.seed + ix))),
        is_expense: true,
        order: ctx.index
      })),
    ], { connect: { user: [u] } });
    const { category: exp_children } = await seed.category((x) => [
      ...x(some_exps.length - parentless_exps, (ctx) => ({
        desc: some_exps.at(parentless_exps + ctx.index),
        color: '#'.concat(...Array(6).fill(0).map((_, ix) => copycat.hex(ctx.seed + ix))),
        is_expense: true,
        order: ctx.index + parentless_exps
      }))
    ], { connect: { user: [u], category: exp_parents } });
    // income
    const { category: inc_parents } = await seed.category((x) => [
      ...x(parentless_incs, (ctx) => ({
        desc: some_incomes.at(ctx.index),
        parent_id: null,
        color: '#'.concat(...Array(6).fill(0).map((_, ix) => copycat.hex(ctx.seed + ix))),
        is_expense: false,
        order: ctx.index
      })),
    ], { connect: { user: [u] } });
    const { category: inc_children } = await seed.category((x) => [
      ...x(some_incomes.length - parentless_incs, (ctx) => ({
        desc: some_incomes.at(parentless_incs + ctx.index),
        color: '#'.concat(...Array(6).fill(0).map((_, ix) => copycat.hex(ctx.seed + ix))),
        is_expense: false,
        order: ctx.index + parentless_incs
      }))
    ], { connect: { user: [u], category: inc_parents } });
    return { category: exp_parents.concat(exp_children, inc_parents, inc_children)} as Store;
};

const populate_accounts = async (seed: SeedClient, u: userScalars, currency: currencyScalars[]) => {

  return await seed.account((x) => [

    // multiple for francs
    ...x({min: 3, max: 8}, (ctx) => ({
      color: '#'.concat(...Array(6).fill(0).map((_, ix) => copycat.hex(ctx.seed + ix))),
      starting_saldo: copycat.int(ctx.seed, {min: 100000, max: 500000}),
      date_created: copycat.dateString(ctx.seed, {
        minYear: new Date().getFullYear() - 4,
        maxYear: new Date().getFullYear() - 2
      }).replace('T', ' ').replace('Z', ''),
      desc: `${account_descs[ctx.index % account_descs.length]}-${ctx.index}`, // loop in order
      order: ctx.index,
      currency_id: currency.at(0)!.id
    })),
    // cash for each currency
    ...x(currency.length, (ctx) => ({
      color: '#'.concat(...Array(6).fill(0).map((_, ix) => copycat.hex(ctx.seed + ix))),
      starting_saldo: copycat.int(ctx.seed, {min: 100000, max: 500000}),
      date_created: copycat.dateString(ctx.seed, {
        minYear: new Date().getFullYear() - 4,
        maxYear: new Date().getFullYear() - 2
      }).replace('T', ' ').replace('Z', ''),
      desc: `cash ${currency.at(ctx.index)!.code}`, // loop in order
      order: ctx.index + 9,
      currency_id: currency.at(ctx.index)!.id
    }))
  ], { connect: { user: [u] } })
};

const populate_agents = async (seed: SeedClient, u: userScalars) => {
  
  const some_desc = copycat.oneOf(agent_descs);
  const desc_with_city = (input: Input) => (
    `${some_desc(input)}, ${copycat.city(input)}`
  );
  const desc_with_street = (input: Input) => (
    `${some_desc(input)}, ${copycat.streetName(input)}`
  );
  const store = new Set();

  return seed.agent((x) => [
    ...x(50, (ctx) => ({
      desc: copycat.unique(ctx.seed, some_desc, store) as string
    })),
    ...x(100, (ctx) => ({
      desc: copycat.unique(ctx.seed, desc_with_city, store) as string
    })),
    ...x(100, (ctx) => ({
      desc: copycat.unique(ctx.seed, desc_with_street, store) as string
    })),
  ], { connect: { user: [u] } })
}

const populate_transfers = async (seed: SeedClient, u: userScalars, account: accountScalars[]) => {
  // only make transfers between francs accounts
  // 2 to 100 francs each
  const franc_accounts = account.filter(acc =>
    acc.desc.includes("CHF") || !acc.desc.startsWith("cash")
  )
  const get_source = copycat.oneOf(account);
  const get_dest = (src_id: number) => copycat.oneOf(account.filter(acc => acc.id != src_id));

  // let's estimate 2 transfers a month, between 2-100 francs, so like roughly max 200 francs up or down from transfers
  let n = 0;
  for (const acc of franc_accounts) {
    n += monthsSince(toDate(acc.date_created)) * 2;
  }

  await seed.account_transfer((x) => [
    ...x(n, (ctx) => {
      const amount = copycat.int(ctx.seed, {
        min: 200, max: 10000
      });
      const src = get_source(ctx.seed);
      const dst = get_dest(src.id)(ctx.seed);
      
      let min: Date;
      if (toDate(src.date_created) < toDate(dst.date_created))
        min = toDate(src.date_created)
      else
        min = toDate(dst.date_created)
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);;
      return {
        src_amount: amount,
        dst_amount: amount,
        src_id: src.id, dst_id: dst.id,
        date_issued: copycat.dateString(ctx.seed, {min, max: endOfMonth}).replace('T', ' ').replace('Z', '')
      }
    })
  ], {
    connect: { account: franc_accounts, user: [u] }
  })
}

const populate_transactions = async (seed: SeedClient, u: userScalars, account: accountScalars[], agent: agentScalars[]) => {
  // only make transfers between francs accounts
  // 2 to 100 francs each

  // MAIN ACCOUNT
  // let's estimate 50 expenses a month, 1-20 francs, so like roughly 500 francs down
  // let's estimate 10 expenses a month, 50-200 francs, so like roughly 1000 francs down
  // let's estimate 1.5 expenses a month, 500-1000 francs, so like roughly 1300 francs down
  // about 2800 upperbound
  // so let's say about 2 times around 500 francs and 1 time 2000 or more

  const main_acc = account.at(0)!;
  const start = toDate(main_acc.date_created);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  const gen_trans_betw = (min_fr: number, max_fr: number, is_exp: boolean) =>
    (ctx: ModelCallbackContext & { index: number }) => 
      ({
          amount: copycat.int(ctx.seed, { min: min_fr*100, max: max_fr*100 }),
          is_expense: is_exp,
          date_issued: copycat.dateString(ctx.seed, {min: start, max: endOfMonth}).replace('T', ' ').replace('Z', ''),
          currency_id: main_acc.currency_id,
          account_id: main_acc.id
      })

  const { trans: main_trans } = await seed.trans((x) => [
    ...x(monthsSince(start) * 50, gen_trans_betw(1, 20, true)),
    ...x(monthsSince(start) * 10, gen_trans_betw(50, 200, true)),
    ...x(Math.floor(monthsSince(start) * 1.5), gen_trans_betw(500, 1000, true)),
    ...x(Math.floor(monthsSince(start) * 1.5), gen_trans_betw(300, 700, false)),
    ...x(Math.floor(monthsSince(start) * 1.5), gen_trans_betw(1800, 2400, false)),
  ], {
    connect: { agent, user: [u] }
  })

  const gen_other_exp = (acc: accountScalars) => (ctx: ModelCallbackContext & { index: number }) => 
    ({
        amount: copycat.int(ctx.seed, { min: 2*100, max: 50*100 }),
        is_expense: true,
        date_issued: copycat.dateString(ctx.seed, {min: toDate(acc.date_created), max: endOfMonth}).replace('T', ' ').replace('Z', ''),
        currency_id: acc.currency_id,
        account_id: acc.id
    })
  
  const gen_other_inc = (acc: accountScalars) => (ctx: ModelCallbackContext & { index: number }) => 
    ({
        amount: copycat.int(ctx.seed, { min: 50*100, max: 150*100 }),
        is_expense: false,
        date_issued: copycat.dateString(ctx.seed, {min: toDate(acc.date_created), max: endOfMonth}).replace('T', ' ').replace('Z', ''),
        currency_id: acc.currency_id,
        account_id: acc.id
    })

  // OTHER ACCOUNTS
  const { trans: other_trans } = await seed.trans((x) => 
    x({min: 40, max: 60}, gen_other_exp(account.at(1)!))
    .concat(
      x({min: 10, max: 30}, gen_other_inc(account.at(1)!)),
      ...account.slice(2).map(
        acc => (
          x({min: 40, max: 60}, gen_other_exp(acc))
          .concat(
            x({min: 10, max: 30}, gen_other_inc(acc))
          )
        )
      )
    ), {
    connect: { agent, user: [u] }
  })

  return { trans: main_trans.concat(other_trans)} as Store
}

const populate_records = async (seed: SeedClient, trans: transScalars[], category: categoryScalars[]) => {

  const expense_cats = category.filter(cat => cat.is_expense);
  const income_cats = category.filter(cat => !cat.is_expense);

  const exp_skeleton = trans.filter(t => t.is_expense).map((t, ix) => {
    const coin = copycat.int(ix, {min: 1, max: 10});
    if (coin > 1)
      return [{
        amount: t.amount, trans_id: t.id
      }]
    else {
      const a1 = copycat.int('split' + ix, {min: 1, max: t.amount})
      return [
        { amount: a1, trans_id: t.id },
        { amount: t.amount - a1, trans_id: t.id }
      ]
    }
  }).flat(1);
  const inc_skeleton = trans.filter(t => !t.is_expense).map((t, ix) => {
    return {
      amount: t.amount, trans_id: t.id
    }
  });
  
  await seed.record((x) => x(exp_skeleton.length, (ctx) => ({
    ...exp_skeleton.at(ctx.index)
  })), { connect: { category: expense_cats } });
  
  await seed.record((x) => x(inc_skeleton.length, (ctx) => ({
    ...inc_skeleton.at(ctx.index)
  })), { connect: { category: income_cats } });

}

const toDate = (date_field: string | number | Date) => new Date(date_field as string)

const monthsSince = (date: Date) => {
    var months;
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    months = (endOfMonth.getFullYear() - date.getFullYear()) * 12;
    months -= date.getMonth();
    months += endOfMonth.getMonth();
    return months <= 0 ? 0 : months;
};

export default populate_db;