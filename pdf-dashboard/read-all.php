<?php
// read-all.php - Read all analysis results from database

// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database credentials (replace with your actual values)
$host = 'localhost';
$dbname = 'u969084943_ai_takeOff';
$username = 'u969084943_admin';
$password = 'Construction2020?';

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get optional parameters
    $limit = $_GET['limit'] ?? 50; // Default to 50 for "all" endpoint
    $offset = $_GET['offset'] ?? 0; // For pagination
    
    // Get all analysis results with limit and offset
    $sql = "SELECT 
                id, 
                file_name, 
                file_size, 
                company, 
                jobsite,
                blue_x_shapes, 
                red_squares, 
                pink_shapes, 
                green_rectangles, 
                status, 
                created_at,
                original_url,
                step4_results_url,
                step5_results_url,
                step6_results_url,
                step7_results_url,
                step8_results_url
            FROM analysis_results 
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination info
    $countSql = "SELECT COUNT(*) as total FROM analysis_results";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute();
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'data' => $results,
        'count' => count($results),
        'total' => (int)$totalCount,
        'limit' => (int)$limit,
        'offset' => (int)$offset,
        'hasMore' => ($offset + count($results)) < $totalCount
    ]);
    
} catch (PDOException $e) {
    // Database error
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // General error
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
