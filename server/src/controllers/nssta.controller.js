import { getDb } from '../db/index.js';

export async function getNSSTAProgrammesController(req, res, next) {
  try {
    const db = getDb();
    const { competencyCode, mode } = req.query;

    let query = `
      SELECT np.*, 
             COALESCE(
               json_agg(
                 json_build_object('id', c.id, 'code', c.code, 'name', c.name, 'category', c.category)
               ) FILTER (WHERE c.id IS NOT NULL), '[]'
             ) AS mapped_competencies
      FROM nssta_programmes np
      LEFT JOIN nssta_competency_map ncm ON np.id = ncm.programme_id
      LEFT JOIN competencies c ON ncm.competency_id = c.id
      WHERE np.is_active = true
    `;

    if (mode) {
      query += ` AND np.mode = '${mode}'`;
    }

    query += ` GROUP BY np.id ORDER BY np.created_at DESC`;

    const result = await db.execute(query);
    let programmes = result.rows || result;

    if (competencyCode) {
      programmes = programmes.filter(p => 
        p.mapped_competencies.some(c => c.code === competencyCode)
      );
    }

    return res.status(200).json({ programmes });
  } catch (error) {
    return next(error);
  }
}

export async function getNSSTAProgrammeDetailsController(req, res, next) {
  try {
    const { id } = req.params;
    const db = getDb();

    const result = await db.execute(`
      SELECT np.*, 
             COALESCE(
               json_agg(
                 json_build_object('id', c.id, 'code', c.code, 'name', c.name, 'category', c.category)
               ) FILTER (WHERE c.id IS NOT NULL), '[]'
             ) AS mapped_competencies
      FROM nssta_programmes np
      LEFT JOIN nssta_competency_map ncm ON np.id = ncm.programme_id
      LEFT JOIN competencies c ON ncm.competency_id = c.id
      WHERE np.id = '${id}'
      GROUP BY np.id
    `);

    const programme = (result.rows || result)[0];
    if (!programme) {
      return res.status(404).json({ message: 'NSSTA Programme not found.' });
    }

    return res.status(200).json({ programme });
  } catch (error) {
    return next(error);
  }
}
