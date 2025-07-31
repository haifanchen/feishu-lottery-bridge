// api/lottery.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { order, gift, time } = req.body;
  if (!order || !gift || !time) return res.status(400).json({ error: 'missing fields' });

  // 1) 拿 tenant_access_token
  const tokenRes = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET
    })
  });
  const { tenant_access_token } = await tokenRes.json();

  // 2) 写入多维表
  const writeRes = await fetch(
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

  if (!writeRes.ok) {
    const err = await writeRes.text();
    return res.status(500).json({ error: 'feishu error', detail: err });
  }

  res.json({ code: 0, msg: 'ok' });
};