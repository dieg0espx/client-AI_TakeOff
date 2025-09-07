<?php

// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Database credentials (replace with your actual values)
$host = 'localhost';
$dbname = 'u969084943_ai_takeOff';
$username = 'u969084943_admin';
$password = 'Construction2020?';

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get data from POST request
    $id = $_POST['id'] ?? '';
    $fileName = $_POST['file_name'] ?? '';
    $fileSize = $_POST['file_size'] ?? 0;
    $blueXShapes = $_POST['blue_x_shapes'] ?? 0;
    $redSquares = $_POST['red_squares'] ?? 0;
    $pinkShapes = $_POST['pink_shapes'] ?? 0;
    $greenRectangles = $_POST['green_rectangles'] ?? 0;
    $originalUrl = $_POST['original_url'] ?? '';
    $step4Url = $_POST['step4_results_url'] ?? '';
    $step5Url = $_POST['step5_results_url'] ?? '';
    $step6Url = $_POST['step6_results_url'] ?? '';
    $step7Url = $_POST['step7_results_url'] ?? '';
    $step8Url = $_POST['step8_results_url'] ?? '';
    $extractedText = $_POST['extracted_text'] ?? '';
    $enhancedText = $_POST['enhanced_text'] ?? '';
    $status = $_POST['status'] ?? 'completed';
    $company = $_POST['company'] ?? '';
    $jobsite = $_POST['jobsite'] ?? '';
    
    // Validate required fields
    if (empty($id) || empty($fileName)) {
        throw new Exception('ID and file name are required');
    }
    
    // Prepare SQL statement
    $sql = "INSERT INTO analysis_results (
        id, file_name, file_size, blue_x_shapes, red_squares, pink_shapes, green_rectangles,
        original_url, step4_results_url, step5_results_url, step6_results_url, step7_results_url, step8_results_url,
        extracted_text, enhanced_text, status, company, jobsite
    ) VALUES (
        :id, :file_name, :file_size, :blue_x_shapes, :red_squares, :pink_shapes, :green_rectangles,
        :original_url, :step4_results_url, :step5_results_url, :step6_results_url, :step7_results_url, :step8_results_url,
        :extracted_text, :enhanced_text, :status, :company, :jobsite
    )";
    
    $stmt = $pdo->prepare($sql);
    
    // Bind parameters
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':file_name', $fileName);
    $stmt->bindParam(':file_size', $fileSize, PDO::PARAM_INT);
    $stmt->bindParam(':blue_x_shapes', $blueXShapes, PDO::PARAM_INT);
    $stmt->bindParam(':red_squares', $redSquares, PDO::PARAM_INT);
    $stmt->bindParam(':pink_shapes', $pinkShapes, PDO::PARAM_INT);
    $stmt->bindParam(':green_rectangles', $greenRectangles, PDO::PARAM_INT);
    $stmt->bindParam(':original_url', $originalUrl);
    $stmt->bindParam(':step4_results_url', $step4Url);
    $stmt->bindParam(':step5_results_url', $step5Url);
    $stmt->bindParam(':step6_results_url', $step6Url);
    $stmt->bindParam(':step7_results_url', $step7Url);
    $stmt->bindParam(':step8_results_url', $step8Url);
    $stmt->bindParam(':extracted_text', $extractedText);
    $stmt->bindParam(':enhanced_text', $enhancedText);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':company', $company);
    $stmt->bindParam(':jobsite', $jobsite);
    
    // Execute the statement
    $stmt->execute();
    
    // Return success response
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Analysis result created successfully',
        'id' => $id
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
