export default function createRabRepo(db) {
    async function getRAByear() {
        const { rows } = await db.query(`
    SELECT DISTINCT DATE_PART('year', mulai)
      FROM rab
      ORDER BY DATE_PART('year', mulai) ASC
    `);
    return rows;
    };
    async function getRABbyYear(year) {
        const { rows } = await db.query(`
     SELECT *
      FROM rab
      WHERE DATE_PART('year', mulai) =$1
    `,[year]);
    return rows;
    };
    async function getRABbyId(rab_id) {
        const { rows } = await db.query(`
        SELECT *
      FROM rab
      WHERE id =$1  
      `,[rab_id]);
    return rows;     
      
    };
    async function getRABline(rab_id) {
        const { rows } = await db.query(`
      SELECT *
      FROM rab_line 
      WHERE rab_id = $1
    `,[rab_id]);
    return rows;
    };
    return{
        getRAByear,
        getRABbyYear,
        getRABline,
        getRABbyId
    };
}