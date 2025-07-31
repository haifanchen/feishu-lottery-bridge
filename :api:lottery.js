// api/lottery.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { order, gift, time } = req.body;
  if (!order || !gift || !time) return res.status(400).json({ error: 'missing fields' });

  // 1. 获取 tenant_access_token
  const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET
    })
  });
  const { tenant_access_token } = await tokenRes.json();

  // 2. 新增记录到多维表
  const addRes = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenant_access_token}`
      },
      body: JSON.stringify({ fields: { 订单号: order, 奖品: gift, 抽奖时间: time } })
    }
  );

  if (!addRes.ok) return res.status(500).json({ error: 'feishu error' });

  res.json({ code: 0, msg: 'ok' });
}