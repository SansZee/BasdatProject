USE INTEGRASI_DB
GO

CREATE OR ALTER PROCEDURE sp_KPI_executive
	@company_id NVARCHAR(10)
AS
BEGIN
	SET NOCOUNT ON;
	
	DECLARE @total INT = (SELECT COUNT(*) FROM production_companies WHERE production_company_type_id = @company_id);
	DECLARE @avgRating FLOAT = (SELECT AVG(t.vote_average) FROM production_companies pc JOIN titles t ON pc.title_id = t.title_id WHERE pc.production_company_type_id = @company_id);
	
	-- Result Set 1: Total and Average
	SELECT 
		@total as total_produced,
		@avgRating as average_rating;
	
	-- Result Set 2: Top Types
	SELECT TOP 2 COUNT(*) as count, ty.type_name
	FROM production_companies pc
	JOIN titles t ON pc.title_id = t.title_id
	JOIN types ty ON ty.type_id = t.type_id
	WHERE pc.production_company_type_id = @company_id
	GROUP BY t.type_id, ty.type_name
	ORDER BY COUNT(*) DESC;
	
	-- Result Set 3: Top Genre
	SELECT TOP 1 gt.genre_name, COUNT(DISTINCT t.title_id) as total_title, AVG(t.vote_average) as average_rating
	FROM production_companies pc
	JOIN titles t ON pc.title_id = t.title_id
	JOIN genres g ON t.title_id = g.title_id
	JOIN genre_types gt ON g.genre_type_id = gt.genre_type_id
	WHERE pc.production_company_type_id = @company_id
	GROUP BY gt.genre_type_id, gt.genre_name
	ORDER BY COUNT(DISTINCT t.title_id) DESC;
END
GO
