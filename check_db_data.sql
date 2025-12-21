USE INTEGRASI_DB
GO

PRINT '=== DATABASE DATA CHECK ==='
PRINT ''

PRINT 'Production Companies:'
SELECT TOP 10 production_company_type_id, COUNT(*) as count
FROM production_companies
GROUP BY production_company_type_id
ORDER BY COUNT(*) DESC;

PRINT ''
PRINT 'Titles with rating:'
SELECT TOP 10 title_id, name, vote_average, vote_count
FROM titles
WHERE vote_average IS NOT NULL
ORDER BY vote_average DESC;

PRINT ''
PRINT 'Genres:'
SELECT TOP 10 gt.genre_type_id, gt.genre_name, COUNT(*) as count
FROM genres g
JOIN genre_types gt ON g.genre_type_id = gt.genre_type_id
GROUP BY gt.genre_type_id, gt.genre_name
ORDER BY COUNT(*) DESC;

PRINT ''
PRINT '=== TEST STORED PROCEDURE ==='
EXEC sp_KPI_executive @company_id = 'production_company_1';
